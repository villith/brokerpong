import { Schema, model } from 'mongoose';

const matchSchema = new Schema({
  _id: Schema.Types.ObjectId,
  initator: { type: Schema.Types.ObjectId, ref: 'Player' },
  target: { type: Schema.Types.ObjectId, ref: 'Player' },
  status: String,
  acceptedAt: Date,
  rejectedAt: Date,
  completedAt: Date,
}, { collection: 'match' });

const Match = model('Match', matchSchema);

export default Match;