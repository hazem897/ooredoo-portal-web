// Complete login flow test
const http = require('http');
const fs = require('fs');
const path = require('path');

const testResults = [];

function log(stage, message, data = '') {
  const line = `[${new Date().toISOString()}] ${stage}: ${message}${data ? ' ' + JSON.stringify(data) : ''}`;
  console.log(line);
  testResults.push(line);
}

// Step 1: Test database connection
const db = require('./config/db');

async function runTests() {
  try {
    log('DB', 'Fetching user from database...');
    
    db.query('SELECT id, email, statut, mot_de_passe FROM users WHERE email = ?', 
      ['hazemhazem@gmail.com'], 
      async (err, rows) => {
        if (err) {
          log('DB', '❌ Error:', err.message);
          process.exit(1);
        }

        if (!rows || rows.length === 0) {
          log('DB', '❌ User not found');
          process.exit(1);
        }

        const user = rows[0];
        log('DB', '✅ User found:', { 
          id: user.id, 
          email: user.email, 
          statut: user.statut 
        });

        // Step 2: Test password
        const bcrypt = require('bcryptjs');
        const testPassword = 'Admin123456';
        
        log('BCRYPT', 'Testing password verification...');
        const match = await bcrypt.compare(testPassword, user.mot_de_passe);
        log('BCRYPT', match ? '✅ Password matches' : '❌ Password does not match', { 
          provided: testPassword,
          storedHash: user.mot_de_passe.substring(0, 20) + '...'
        });

        // Step 3: Test API endpoint
        log('API', 'Testing login endpoint...');
        
        const data = JSON.stringify({
          email: 'hazemhazem@gmail.com',
          mot_de_passe: 'Admin123456'
        });

        const options = {
          hostname: 'localhost',
          port: 5000,
          path: '/api/auth/login',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
          }
        };

        const req = http.request(options, (res) => {
          let responseData = '';

          res.on('data', (chunk) => {
            responseData += chunk;
          });

          res.on('end', () => {
            log('API', `Status: ${res.statusCode}`);
            
            let parsed;
            try {
              parsed = JSON.parse(responseData);
            } catch (e) {
              parsed = responseData;
            }

            if (res.statusCode === 200) {
              log('API', '✅ Login successful:', parsed);
              
              // Step 4: Test OTP verification
              if (parsed.devOtp) {
                log('OTP', 'Testing OTP verification with devOtp:', parsed.devOtp);
                
                const otpData = JSON.stringify({
                  userId: parsed.userId,
                  otp: parsed.devOtp
                });

                const otpOptions = {
                  hostname: 'localhost',
                  port: 5000,
                  path: '/api/auth/verify-otp',
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': otpData.length
                  }
                };

                const otpReq = http.request(otpOptions, (otpRes) => {
                  let otpResponseData = '';

                  otpRes.on('data', (chunk) => {
                    otpResponseData += chunk;
                  });

                  otpRes.on('end', () => {
                    log('OTP', `Status: ${otpRes.statusCode}`);
                    
                    let otpParsed;
                    try {
                      otpParsed = JSON.parse(otpResponseData);
                    } catch (e) {
                      otpParsed = otpResponseData;
                    }

                    if (otpRes.statusCode === 200 && otpParsed.token) {
                      log('OTP', '✅ OTP verification successful:', { 
                        token: otpParsed.token.substring(0, 30) + '...',
                        user: otpParsed.user 
                      });
                    } else {
                      log('OTP', '❌ OTP verification failed:', otpParsed);
                    }

                    // Write results to file
                    const resultsFile = path.join(__dirname, 'test_login_results.txt');
                    fs.writeFileSync(resultsFile, testResults.join('\n'));
                    console.log(`\n✅ Test results written to: ${resultsFile}\n`);
                    process.exit(0);
                  });
                });

                otpReq.on('error', (error) => {
                  log('OTP', '❌ Error:', error.message);
                  process.exit(1);
                });

                otpReq.write(otpData);
                otpReq.end();
              }
            } else {
              log('API', '❌ Login failed:', parsed);
              
              // Write results to file
              const resultsFile = path.join(__dirname, 'test_login_results.txt');
              fs.writeFileSync(resultsFile, testResults.join('\n'));
              console.log(`\n❌ Test failed. Results written to: ${resultsFile}\n`);
              process.exit(1);
            }
          });
        });

        req.on('error', (error) => {
          log('API', '❌ Error:', error.message);
          process.exit(1);
        });

        req.write(data);
        req.end();
      }
    );

  } catch (error) {
    log('ERROR', 'Unexpected error:', error.message);
    process.exit(1);
  }
}

runTests();
