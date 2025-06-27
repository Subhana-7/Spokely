import User from '../models/user.model';

export class UserRepository{
  async findByEmail(email:String){
    return User.findOne({email});
  }

  async createUser(data:any){ //change any
    return User.create(data);
  }

  async findByReferalCode(code:String){
    return User.findOne({referalCode:code})
  }
}