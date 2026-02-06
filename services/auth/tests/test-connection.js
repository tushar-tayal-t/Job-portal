import dns from 'dns';
import { promisify } from 'util';
import dotenv from 'dotenv'
dotenv.config();

const lookup = promisify(dns.lookup);

async function testConnection() {
  const dbUrl = process.env.DB_URL;
  
  console.log('1. Checking DATABASE_URL...');
  console.log('URL exists:', !!dbUrl);
  console.log('URL length:', dbUrl?.length);
  
  // Extract hostname from connection string
  try {
    const url = new URL(dbUrl.replace('postgresql://', 'http://'));
    const hostname = url.hostname;
    
    console.log('\n2. Extracted hostname:', hostname);
    
    // Test DNS resolution
    console.log('\n3. Testing DNS resolution...');
    const address = await lookup(hostname);
    console.log('✓ DNS resolved to:', address);
    
    // Test basic fetch to the host
    console.log('\n4. Testing HTTPS connection...');
    const response = await fetch(`https://${hostname}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    console.log('✓ HTTPS connection successful');
    
    // Test actual Neon connection
    console.log('\n5. Testing Neon connection...');
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);
    const result = await sql`SELECT 1 as test`;
    console.log('✓ Database query successful:', result);
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  }
}

testConnection();