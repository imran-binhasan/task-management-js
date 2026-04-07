import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { envValidationSchema } from './env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TaskModule } from './modules/task/task.module';
import { AuditModule } from './modules/audit/audit.module';
import { DatabaseSeedModule } from './database/database-seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    TaskModule,
    AuditModule,
    DatabaseSeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
