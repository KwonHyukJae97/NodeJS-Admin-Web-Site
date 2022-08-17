import {Account} from "../modules/account/entities/account.entity";

interface RequestWithUser extends Request {
    email: string,
    password: string,
}
export default RequestWithUser;