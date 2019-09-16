import { Schema, model } from 'mongoose';

const resultSchema = new Schema({
  _id: Schema.Types.ObjectId,
  match: { type: Schema.Types.ObjectId, ref: 'Match' },
  initatorScore: Number,
  targetScore: Number,
}, { collection: 'result' });

const Result = model('Result', resultSchema);

export default Result;