const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app'); // Adjust the path if necessary
const should = chai.should();
const User = require('../models/userModel');
const Job = require('../models/jobModel');

chai.use(chaiHttp);

describe('API Tests', () => {
  let clientToken, freelancerToken, jobId, clientId, freelancerId;

  before(async () => {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a client
    const clientRes = await chai.request(server)
      .post('/api/auth/register')
      .send({
        username: 'client1',
        email: 'client1@example.com',
        password: 'password123',
        userType: 'client'
      });
    clientToken = clientRes.body.token;
    clientId = clientRes.body.user._id;

    // Add money to client's wallet
    await chai.request(server)
      .post('/api/clients/add-money')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        clientId,
        amount: 1000
      });

    // Create a freelancer
    const freelancerRes = await chai.request(server)
      .post('/api/auth/register')
      .send({
        username: 'freelancer1',
        email: 'freelancer1@example.com',
        password: 'password123',
        userType: 'freelancer'
      });
    freelancerToken = freelancerRes.body.token;
    freelancerId = freelancerRes.body.user._id;

    // Create a job
    const jobRes = await chai.request(server)
      .post('/api/jobs/create')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Test Job',
        description: 'This is a test job',
        budget: 500,
        deadline: '2023-12-31',
        client: clientId
      });
    jobId = jobRes.body._id;
  });

  after(async () => {
    // Clean up the database
    await User.deleteMany({});
    await Job.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/jobs/accept', () => {
    it('should accept a freelancer for a job and transfer money', async () => {
      const res = await chai.request(server)
        .post('/api/jobs/accept')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          jobId,
          freelancerId
        });
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.message.should.equal('Freelancer accepted and paid successfully');
    });
  });

  describe('GET /api/clients/users/:id', () => {
    it('should get user by ID', async () => {
      const res = await chai.request(server)
        .get(`/api/clients/users/${clientId}`)
        .set('Authorization', `Bearer ${clientToken}`);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body._id.should.equal(clientId);
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should get job by ID', async () => {
      const res = await chai.request(server)
        .get(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${clientToken}`);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body._id.should.equal(jobId);
    });
  });
});