import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Role } from 'src/common/enums/role.enum';
import { User } from 'src/modules/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DatabaseSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeedService.name);
  private readonly defaultSeedUsers = [
    {
      name: 'Imran Bin Hasan',
      email: 'imran@example.com',
      role: Role.ADMIN,
    },
    {
      name: 'Sara Rahman',
      email: 'sara@example.com',
      role: Role.USER,
    },
    {
      name: 'Mahir Hasan',
      email: 'mahir@example.com',
      role: Role.USER,
    },
  ] as const;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async onApplicationBootstrap(): Promise<void> {
    await this.seedDefaultUsers();
  }

  private async seedDefaultUsers(): Promise<void> {
    for (const userData of this.defaultSeedUsers) {
      await this.ensureUser(userData);
    }
  }

  private async ensureUser(userData: {
    name: string;
    email: string;
    role: Role;
  }): Promise<void> {
    const existing = await this.userRepo
      .createQueryBuilder('user')
      .withDeleted()
      .where('user.email = :email', { email: userData.email })
      .getOne();

    if (existing) {
      if (existing.deletedAt) {
        await this.userRepo.restore(existing.id);
        this.logger.log(`Restored seeded user ${userData.email}`);
      }
      return;
    }

    const bootstrapPassword = this.generateBootstrapPassword();
    const password = await bcrypt.hash(bootstrapPassword, 10);
    const user = this.userRepo.create({
      name: userData.name,
      email: userData.email,
      password,
      role: userData.role,
    });

    await this.userRepo.save(user);
    this.logger.log(`Created seeded user ${userData.email}`);
    this.logger.warn(
      `Bootstrap credentials for ${userData.email}: ${bootstrapPassword}`,
    );
  }

  private generateBootstrapPassword(): string {
    // Keeps generated credentials URL-safe and easy to paste in terminals.
    return randomBytes(12).toString('base64url');
  }
}
