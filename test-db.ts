// test-db.ts
import { db } from './lib/db';
import { users, schedules } from './lib/db-schema';

async function test() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test query users
    const userCount = await db.select().from(users);
    console.log('✅ Users table accessible. Count:', userCount.length);
    
    // Test query schedules  
    const scheduleCount = await db.select().from(schedules);
    console.log('✅ Schedules table accessible. Count:', scheduleCount.length);
    
    console.log('\n🎉 Database connection successful!');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

test();