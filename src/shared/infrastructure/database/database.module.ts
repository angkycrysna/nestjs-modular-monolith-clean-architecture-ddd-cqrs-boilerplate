import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('database.host')!;
        const port = config.get<number>('database.port')!;
        const username = config.get<string>('database.username')!;
        const password = config.get<string>('database.password')!;
        const database = config.get<string>('database.database')!;
        const ssl = config.get<boolean>('database.ssl')!;

        // ── Read Replica ──
        // When DB_REPLICA_HOST is set, TypeORM automatically routes:
        //   - write operations (save/update/delete) → master
        //   - read operations (find/select)         → slave
        // This aligns with CQRS: commands hit master, queries hit replica.
        const replicaHost = config.get<string>('database.replicaHost');
        const replicaPort = config.get<number>('database.replicaPort')!;
        const hasReplica = !!replicaHost;

        const sslConfig = ssl ? { rejectUnauthorized: false } : false;

        // ── Single connection (no replica) ──
        if (!hasReplica) {
          return {
            type: 'postgres' as const,
            host,
            port,
            username,
            password,
            database,
            ssl: sslConfig,
            autoLoadEntities: true,
            synchronize: false, // Always use migrations in production
          };
        }

        // ── Replication mode (with replica) ──
        // To enable: set DB_REPLICA_HOST in your env vars.
        // To add more replicas: extend the slaves array with additional hosts.
        return {
          type: 'postgres' as const,
          replication: {
            master: { host, port, username, password, database },
            slaves: [
              {
                host: replicaHost,
                port: replicaPort,
                username,
                password,
                database,
              },
              // Add more replicas here if needed:
              // { host: 'replica-2-host', port: 5432, username, password, database },
            ],
          },
          ssl: sslConfig,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
