import mongoose from 'mongoose';
import Track from './src/models/Track';
import TrackedProblem from './src/models/TrackedProblem';
import User from './src/models/User';
import { getAnalytics } from './src/controllers/admin/analyticsController';

async function testAnalytics() {
  await mongoose.connect('mongodb://localhost:27017/dsa-test-db-analytics-review');
  await Track.deleteMany({});
  await TrackedProblem.deleteMany({});
  await User.deleteMany({});

  const user = new User({ email: 'test@example.com', password: 'password', username: 'testuser' });
  await user.save();

  const track = new Track({
    title: '[TEST] Mock Track',
    description: 'This is a test track created to verify analytics completion rate',
    problems: [{ titleSlug: 'two-sum', title: 'Two Sum', difficulty: 'Easy' }]
  });
  await track.save();

  await TrackedProblem.create({ user: user._id, titleSlug: 'two-sum', attemptCount: 1 });
  await TrackedProblem.create({ user: user._id, titleSlug: 'three-sum', attemptCount: 1 });

  const req = {} as any;
  const res = {
    json: (data: any) => {
      console.log(JSON.stringify(data, null, 2));
    },
    status: (code: number) => {
      return {
        json: (data: any) => console.log('Error', code, data)
      };
    }
  } as any;

  await getAnalytics(req, res);

  await mongoose.disconnect();
}

testAnalytics().catch(console.error);
