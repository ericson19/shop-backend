// utils/emailTemplates.js

const baseTemplate = (content) => {
  return `
  <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial, sans-serif;">
    
        <div style="display:flex;justify-content:center;align-items:center;padding:40px 20px;">
          <table width="100%"
            style="background:#ffffff;border-radius:10px;padding:30px;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
              <td style="text-align:center;padding-bottom:20px;">
                <h2 style="margin:0;color:#333;">Your App</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="color:#555;font-size:14px;line-height:1.6;">
                ${content}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="text-align:center;padding-top:30px;font-size:12px;color:#999;">
                <p>© ${new Date().getFullYear()} Your App. All rights reserved.</p>
              </td>
            </tr>

          </table>

        </div>
  </div>
  `;
};
module.exports = { baseTemplate };
