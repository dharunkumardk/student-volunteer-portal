async function runTest() {
  const baseUrl = 'http://localhost:5000/api';
  
  const post = async (url, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(baseUrl + url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw { status: res.status, data };
    return data;
  };

  const get = async (url, token) => {
    const res = await fetch(baseUrl + url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw { status: res.status, data };
    return data;
  };

  try {
    const ts = Date.now();
    const orgEmail = `org_${ts}@test.com`;
    const stuEmail = `stu_${ts}@test.com`;

    await post(`/auth/send-otp`, { name: 'Org Planner', email: orgEmail, password: 'password', role: 'organizer' });
    const orgLogin = await post(`/auth/login`, { email: orgEmail, password: 'password' });
    const orgToken = orgLogin.token;

    await post(`/auth/send-otp`, { name: 'Stu Volunteer', email: stuEmail, password: 'password', role: 'student' });
    const stuLogin = await post(`/auth/login`, { email: stuEmail, password: 'password' });
    const stuToken = stuLogin.token;
    
    console.log("Registered and logged in test users.");

    const todayStr = new Date().toISOString().split('T')[0];

    const makeEvent = async (title, date, time, hours) => {
      return await post(`/events/create`, {
        title, description: 'Test', capacity: 10, date, time, hours
      }, orgToken);
    };

    console.log("Creating Events...");
    await makeEvent('Event A 10-12', todayStr, '10:00', 2);
    await makeEvent('Event B 11-14', todayStr, '11:00', 3);
    await makeEvent('Event C 12-14', todayStr, '12:00', 2);

    const events = await get(`/events`, stuToken);
    const orgEvents = events.filter(e => e.title.includes('Event ') && e.createdBy?._id === orgLogin.user.id);
    const evA = orgEvents.find(e => e.title.includes('Event A'));
    const evB = orgEvents.find(e => e.title.includes('Event B'));
    const evC = orgEvents.find(e => e.title.includes('Event C'));

    const joinEvent = async (eventId, label) => {
      try {
        const res = await post(`/events/join/${eventId}`, {}, stuToken);
        console.log(`✅ [${label}] Join successful: ${res.message}`);
      } catch (e) {
        console.log(`❌ [${label}] Join failed: ${e.status} - ${e.data?.message}`);
      }
    };

    console.log("Testing Join Contexts...");
    await joinEvent(evA._id, 'Join Event A 10-12');
    await joinEvent(evB._id, 'Join Event B 11-14 (Overlap)');
    await joinEvent(evC._id, 'Join Event C 12-14 (Back-to-back)');

  } catch (error) {
    console.error("Test Setup Error:", error.data || error.message || error);
  }
}

runTest();
