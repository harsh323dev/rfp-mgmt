import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { extractProposalFromEmail } from './aiService';
import Proposal from '../models/Proposal';
import Vendor from '../models/Vendor';
import RFP from '../models/RFP';

const imapConfig = {
  user: process.env.IMAP_USER as string,
  password: process.env.IMAP_PASS as string,
  host: process.env.IMAP_HOST as string,
  port: parseInt(process.env.IMAP_PORT || '993'),
  tls: process.env.IMAP_TLS === 'true',
  tlsOptions: { rejectUnauthorized: false },
};

export const checkForVendorResponses = async (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig);

    imap.once('ready', () => {
      console.log('📬 IMAP connected, checking inbox...');
      
      imap.openBox('INBOX', false, (err: Error, box: any) => {
        if (err) {
          console.error('❌ Error opening inbox:', err);
          imap.end();
          return reject(err);
        }

        // Search for unread emails with subject containing "RFP"
        imap.search(['UNSEEN', ['SUBJECT', 'RFP']], (err: Error, results: number[]) => {
          if (err) {
            console.error('❌ Search error:', err);
            imap.end();
            return reject(err);
          }

          if (!results || results.length === 0) {
            console.log('📭 No new vendor responses');
            imap.end();
            return resolve([]);
          }

          console.log(`📨 Found ${results.length} new vendor response(s)`);

          const fetch = imap.fetch(results, { bodies: '' });
          const proposals: any[] = [];
          let processed = 0;

          fetch.on('message', (msg: any, seqno: number) => {
            msg.on('body', (stream: any) => {
              simpleParser(stream, async (err: Error | null, parsed: ParsedMail) => {
                if (err) {
                  console.error('❌ Parse error:', err);
                  processed++;
                  return;
                }

                try {
                  const fromText = parsed.from?.text || 'Unknown';
                  const subject = parsed.subject || 'No Subject';
                  
                  console.log(`📧 Processing email from: ${fromText}`);
                  console.log(`📧 Subject: ${subject}`);

                  const emailBody = parsed.text || '';
                  const fromEmail = parsed.from?.value?.[0]?.address || '';

                  // Use AI to extract proposal details
                  const proposalData = await extractProposalFromEmail(
                    emailBody,
                    fromEmail,
                    subject
                  );

                  if (proposalData) {
                    // Find vendor by email
                    const vendor = await Vendor.findOne({ email: proposalData.vendorEmail });
                    
                    if (vendor) {
                      // Extract RFP title from subject (format: "Re: RFP: Office Chair Procurement")
                      const rfpTitle = subject.replace(/^Re:\s*RFP:\s*/i, '').trim();
                      const rfp = await RFP.findOne({ title: rfpTitle });
                      
                      if (rfp) {
                        // Save proposal to database
                        const proposalDoc = await Proposal.create({
                          rfp: rfp._id,
                          vendor: vendor._id,
                          totalPrice: proposalData.totalPrice,
                          deliveryDays: proposalData.deliveryDays,
                          warrantyMonths: proposalData.warrantyMonths,
                          notes: proposalData.notes,
                        });
                        
                        proposals.push(proposalDoc);
                        console.log('✅ Proposal saved to database');
                      } else {
                        console.log('⚠️ RFP not found for title:', rfpTitle);
                        proposals.push(proposalData);
                      }
                    } else {
                      console.log('⚠️ Vendor not found for email:', proposalData.vendorEmail);
                      proposals.push(proposalData);
                    }
                  }
                } catch (error) {
                  console.error('❌ Error processing email:', error);
                }

                processed++;
                if (processed === results.length) {
                  imap.end();
                }
              });
            });
          });

          fetch.once('error', (err: Error) => {
            console.error('❌ Fetch error:', err);
            imap.end();
            reject(err);
          });

          fetch.once('end', () => {
            console.log('✅ Email fetch completed');
            setTimeout(() => {
              if (imap.state !== 'disconnected') {
                imap.end();
              }
              resolve(proposals);
            }, 2000);
          });
        });
      });
    });

    imap.once('error', (err: Error) => {
      console.error('❌ IMAP error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('📪 IMAP connection closed');
    });

    imap.connect();
  });
};
