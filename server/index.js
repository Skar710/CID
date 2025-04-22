const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://skargaming26:PlS5r4mpBfp3TYcn@skar.l6ajvq8.mongodb.net/?retryWrites=true&w=majority&appName=Skar')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const crimeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  date: { type: Date, required: true },
  description: String,
  status: { type: String, enum: ['reported', 'investigating', 'solved'], default: 'reported' },
  createdAt: { type: Date, default: Date.now }
});

const forensicReportSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true },
  crimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crime', required: true },
  reportDate: { type: Date, default: Date.now },
  findings: { type: String, required: true },
  evidence: [String],
  analyst: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'reviewed'], default: 'pending' }
});

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  specialization: String,
  contact: {
    email: String,
    phone: String
  },
  location: String,
  status: { type: String, enum: ['active', 'on-leave', 'unavailable'], default: 'active' }
});

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  leader: { type: String, required: true },
  members: [teamMemberSchema],
  activeCases: { type: Number, default: 0 },
  department: { type: String, required: true }
});

const criminalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  alias: [String],
  dateOfBirth: Date,
  nationality: String,
  status: { type: String, enum: ['at-large', 'in-custody', 'deceased'], default: 'at-large' },
  dangerLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
  lastKnownLocation: String,
  associatedCrimes: [String],
  physicalDescription: {
    height: String,
    weight: String,
    distinguishingFeatures: [String]
  }
});

const evidenceSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  collectedBy: { type: String, required: true },
  collectionDate: { type: Date, required: true },
  status: { type: String, enum: ['processing', 'analyzed', 'stored', 'disposed'], default: 'processing' },
  analysisResults: String,
  chainOfCustody: [{
    handler: String,
    action: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

const intelligenceReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['strategic', 'tactical', 'operational'], required: true },
  content: { type: String, required: true },
  source: { type: String, required: true },
  reliability: { type: String, enum: ['confirmed', 'probable', 'possible', 'doubtful'], required: true },
  classification: { type: String, enum: ['confidential', 'secret', 'top-secret'], default: 'confidential' },
  dateReceived: { type: Date, default: Date.now },
  analyst: { type: String, required: true },
  relatedCases: [String],
  status: { type: String, enum: ['active', 'archived', 'pending-review'], default: 'active' },
  tags: [String],
  lastUpdated: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Crime = mongoose.model('Crime', crimeSchema);
const ForensicReport = mongoose.model('ForensicReport', forensicReportSchema);
const Team = mongoose.model('Team', teamSchema);
const Criminal = mongoose.model('Criminal', criminalSchema);
const Evidence = mongoose.model('Evidence', evidenceSchema);
const IntelligenceReport = mongoose.model('IntelligenceReport', intelligenceReportSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, 'your-secret-key');
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crime Routes
app.post('/api/crimes', authenticateToken, async (req, res) => {
  try {
    const crime = new Crime(req.body);
    await crime.save();
    res.status(201).json(crime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/crimes', authenticateToken, async (req, res) => {
  try {
    const crimes = await Crime.find();
    res.json(crimes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/crimes/:id', authenticateToken, async (req, res) => {
  try {
    const crime = await Crime.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(crime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/crimes/:id', authenticateToken, async (req, res) => {
  try {
    await Crime.findByIdAndDelete(req.params.id);
    res.json({ message: 'Crime deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forensic Report Routes
app.get('/api/forensics', authenticateToken, async (req, res) => {
  try {
    const reports = await ForensicReport.find().populate('crimeId');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/forensics', authenticateToken, async (req, res) => {
  try {
    const report = new ForensicReport(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/forensics/:id', authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }

    const report = await ForensicReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/forensics/:id', authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }

    const report = await ForensicReport.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Team Routes
app.get('/api/teams', authenticateToken, async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/teams', authenticateToken, async (req, res) => {
  try {
    const team = new Team(req.body);
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Criminal Routes
app.get('/api/criminals', authenticateToken, async (req, res) => {
  try {
    const criminals = await Criminal.find();
    res.json(criminals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/criminals', authenticateToken, async (req, res) => {
  try {
    const criminal = new Criminal(req.body);
    await criminal.save();
    res.status(201).json(criminal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/criminals/:id', authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid criminal ID' });
    }

    const criminal = await Criminal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!criminal) {
      return res.status(404).json({ message: 'Criminal not found' });
    }

    res.json(criminal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/criminals/:id', authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid criminal ID' });
    }

    const criminal = await Criminal.findByIdAndDelete(req.params.id);
    
    if (!criminal) {
      return res.status(404).json({ message: 'Criminal not found' });
    }

    res.json({ message: 'Criminal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Evidence Routes
app.get('/api/evidence', authenticateToken, async (req, res) => {
  try {
    const evidence = await Evidence.find();
    res.json(evidence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/evidence', authenticateToken, async (req, res) => {
  try {
    const evidence = new Evidence({
      ...req.body,
      chainOfCustody: [{
        handler: req.body.collectedBy,
        action: 'collected',
        timestamp: new Date(req.body.collectionDate)
      }]
    });
    await evidence.save();
    res.status(201).json(evidence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/evidence/:id', authenticateToken, async (req, res) => {
  try {
    const evidence = await Evidence.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        chainOfCustody: [
          ...req.body.chainOfCustody,
          {
            handler: req.body.handler,
            action: req.body.action,
            timestamp: new Date()
          }
        ]
      },
      { new: true }
    );
    res.json(evidence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/evidence/:id', authenticateToken, async (req, res) => {
  try {
    await Evidence.findByIdAndDelete(req.params.id);
    res.json({ message: 'Evidence deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Intelligence Report Routes
app.get('/api/intelligence', authenticateToken, async (req, res) => {
  try {
    const reports = await IntelligenceReport.find().sort({ dateReceived: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/intelligence', authenticateToken, async (req, res) => {
  try {
    const report = new IntelligenceReport(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/intelligence/:id', authenticateToken, async (req, res) => {
  try {
    const report = await IntelligenceReport.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/intelligence/:id', authenticateToken, async (req, res) => {
  try {
    await IntelligenceReport.findByIdAndDelete(req.params.id);
    res.json({ message: 'Intelligence report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});