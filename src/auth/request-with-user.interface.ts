import {Account} from "../modules/account/entities/account.entity";

interface RequestWithUser extends Request {
    account: Account;
}
export default RequestWithUser;