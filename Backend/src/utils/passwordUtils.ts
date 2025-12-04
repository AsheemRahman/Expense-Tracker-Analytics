import bcrypt from 'bcryptjs'


class PasswordUtils {

    static async passwordHash(password: string): Promise<string> {
        const hashpassword = await bcrypt.hash(password, 10);
        return hashpassword;
    }

    static async comparePassword(userPassword: string, dbPassword: string): Promise<boolean> {
        return await bcrypt.compare(userPassword, dbPassword)
    }

}

export default PasswordUtils;