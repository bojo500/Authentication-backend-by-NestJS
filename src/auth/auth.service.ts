import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException, UnauthorizedException
} from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { User } from "../users/entities";
import { RegisterDto } from "../users/dto";
import { TokenPayloadInterface } from "./interfaces";
import * as sgMail from '@sendgrid/mail';
import { response } from "express";


@Injectable()export class AuthService {
  constructor( private usersService: UsersService,
               private jwtService: JwtService)
  {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async login(user: any): Promise<any> {
    let payload: TokenPayloadInterface;
    try {
      payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);
      return {
        message: 'Login successful',
        token: token,
      };
    } catch (e) {
      throw new BadRequestException('Failed to generate token');
    }
  }

  async register(user: RegisterDto): Promise<any> {
    const existingUser: User = await this.usersService.findOneByEmail(user?.email);
    if (existingUser) {
      this.handleBadRequest("Email or username already exists");
    }
    user.password = await bcrypt.hash(user.password, 10);
    let newUser: User;
    try {
      newUser = await this.usersService.createUser(user);
    } catch {
      throw new InternalServerErrorException();
    }
    const verificationToken = this.jwtService.sign({ email: newUser.email }, { expiresIn: '1h' });
    const msg = {
      to: newUser.email,
      from: 'flavasava1212@gmail.com',
      subject: 'Verify your email',
      text: `Please verify your email by clicking the following link: ${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`,
      html: `<strong>Please verify your email by clicking the following link:</strong> <a href="${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}">Verify Email</a>`,
    };
    try {
      await sgMail.send(msg);
      console.log('Verification email sent successfully');
      console.log(msg);
    } catch (error) {
      console.error('Error sending verification email:', error);
      if (error.response) {
        console.error('Error response:', error.response.body);
      }
      throw new InternalServerErrorException('Failed to send verification email');
    }
    return {
      message: "Created Successfully, please verify your email",
      statusCode: HttpStatus.CREATED
    };
  }

  async verifyEmail(token: string): Promise<void> {
    let decoded;
    try {
      decoded = this.jwtService.verify(token);
    } catch (e) { throw new UnauthorizedException('Invalid or expired verification token');}
    const user = await this.usersService.findOneByEmail(decoded.email);
    if (!user) { throw new BadRequestException('User not found');}
    user.isVerified = true;
    await this.usersService.update(user.id, user);
  }

  handleBadRequest(message: string): void {
    throw new BadRequestException({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user: User = await this.usersService.findOneByEmail(email);
    if (user) {
      const isPasswordCorrect = await bcrypt.compare(password, user?.password);
      if (isPasswordCorrect) {
        delete user.password;
        return user;
      }
    }
    return null;
  }

  async checkAuth(token: string): Promise<TokenPayloadInterface> {
    let verifyObject: TokenPayloadInterface;
    try {
      verifyObject = await this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException();
    }
    return verifyObject;
  }
}
