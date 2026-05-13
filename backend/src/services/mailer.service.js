import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export async function sendEmail(to, subject, htmlContent) {
  try {
    await transporter.sendMail({
      from: `"TaskFlow System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent
    })
    console.log(`✅ Đã gửi email thành công tới: ${to}`)
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error)
    throw new Error('Không thể gửi email lúc này. Vui lòng thử lại sau.')
  }
}