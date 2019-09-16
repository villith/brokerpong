import { Typegoose, prop } from 'typegoose';

class Player extends Typegoose {
  @prop()
  public name: string;
  public nickname: string;
  public emojiFlair: string;
  public tagline: string;
  public victoryLine: string;
  public defeatLine: string;
  public elo: number; 
}

const PlayerModel = new Player().getModelForClass(Player);

export default PlayerModel;