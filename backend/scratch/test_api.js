import axios from 'axios';

async function testProfile() {
    try {
        const res = await axios.get('http://localhost:5000/api/users/1');
        console.log('User 1:', res.data);
    } catch (err) {
        console.error('Error fetching user 1:', err.response?.data || err.message);
    }
}

testProfile();
