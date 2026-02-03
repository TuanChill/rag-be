import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '@/api/user/entities/user.entity';
import { findCreateData, findUpdateData } from '@utils/array.util';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { userData } from '../data/user.data';

const SALT_ROUNDS = 10;

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    Logger.log('---------- Start UserSeeder ----------');
    const existedData = await em.find(User, {});

    // Hash passwords in seed data
    const userDataWithHashedPasswords = await Promise.all(
      userData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, SALT_ROUNDS),
      })),
    );

    const createdNewData = findCreateData<User>(
      existedData,
      userDataWithHashedPasswords,
      'username',
    );

    const updatedOldData = findUpdateData<User>(
      existedData,
      userDataWithHashedPasswords,
      'username',
    );

    createdNewData.map((item) => {
      const newItem = em.create(User, item as any);
      em.persist(newItem);
    });

    Logger.log(`Created ${createdNewData.length} new users`);

    updatedOldData.map((item) => {
      const existedItem = existedData.find(
        (existed) => existed.username === item.username,
      );
      if (existedItem) {
        em.assign(existedItem, item as any);
        em.persist(existedItem);
      }
    });

    Logger.log(`Updated ${updatedOldData.length} existing users`);

    await em.flush();
    Logger.log('---------- End UserSeeder ----------');
  }
}
