export async function authenticate(request, reply) {
  try {
    const decoded = await request.jwtVerify()
    request.user = {
      userId: decoded.id || decoded.userId,
      email: decoded.email
    }
  } catch (err) {
    reply.code(401).send({ message: 'Unauthorized' })
  }
}