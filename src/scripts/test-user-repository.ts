import { prisma } from '../lib/prisma.js';
import { userRepository } from '../repositories/user.repository.js';

async function main() {
  const email = 'test@example.com';

  let user = await userRepository.findByEmail(email);

  if (!user) {
    user = await userRepository.create({
      name: 'Test User',
      email,
      passwordHash: 'test-password-hash',
    });

    console.log('Created user:', user);
  } else {
    console.log('User already exists:', user);
  }

  const foundById = await userRepository.findById(user.id);

  console.log('Found by ID:', foundById);

  const updatedUser = await userRepository.updateById(user.id, {
    name: 'Updated Test User',
  });

  console.log('Updated user:', updatedUser);

  const deletedUser = await userRepository.softDelete(user.id);

  console.log('Soft deleted user:', deletedUser);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });