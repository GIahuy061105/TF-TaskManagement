import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const data = await resend.emails.send({
      from: 'TaskFlow <onboarding@resend.dev>',
      to: to,
      subject: subject,
      html: htmlContent
    })
    console.log("Gửi mail thành công:", data)
    return data
  } catch (error) {
    console.error("Lỗi Resend:", error)
    throw error
  }
}