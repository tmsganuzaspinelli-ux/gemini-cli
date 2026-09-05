/**
 * Da de alta a la abuela.
 *
 * La familia ejecuta esto una sola vez, eligiendo usuario y contraseña:
 *   ABUELA_USUARIO=abuela ABUELA_CLAVE="una clave larga" ABUELA_NOMBRE="Doña Carmen" npm run db:seed
 *
 * Si se vuelve a ejecutar con la misma persona, sólo actualiza la contraseña
 * (útil el día que ella la olvide, que llegará).
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = (process.env.ABUELA_USUARIO ?? 'abuela').trim().toLowerCase();
  const password = process.env.ABUELA_CLAVE;
  const displayName = process.env.ABUELA_NOMBRE ?? 'Abuela';

  if (!password || password.length < 8) {
    console.error(
      '\n  Falta la contraseña.\n\n' +
        '  Elija una de al menos 8 caracteres, fácil de recordar para ella\n' +
        '  (tres palabras sueltas funcionan de maravilla), y ejecute:\n\n' +
        '    ABUELA_USUARIO=abuela ABUELA_CLAVE="mi clave" ABUELA_NOMBRE="Doña Carmen" npm run db:seed\n',
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const usuario = await prisma.user.upsert({
    where: { username },
    update: { passwordHash, displayName },
    create: { username, passwordHash, displayName },
  });

  // Le dejamos abierta su primera tertulia, para que no empiece en blanco.
  const tertulias = await prisma.conversation.count({ where: { userId: usuario.id } });
  if (tertulias === 0) {
    await prisma.conversation.create({ data: { userId: usuario.id } });
  }

  console.log(`\n  Listo. ${displayName} ya puede entrar con el usuario "${username}".\n`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
