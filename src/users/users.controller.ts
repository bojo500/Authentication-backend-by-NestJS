import { Body, Controller, Delete, Get, HttpStatus, InternalServerErrorException, Param, Patch, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto, UpdateUserDto } from "./dto";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("users")
@ApiTags('User 👤')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create one User" })
  @ApiResponse({ status: HttpStatus.CREATED, description: "User successfully created" })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return { statusCode: HttpStatus.CREATED, data: user };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Get()
  @ApiOperation({ summary: "Get All Users" })
  @ApiResponse({ status: HttpStatus.OK, description: "List of all users" })
  async findAll() {
    try {
      const users = await this.usersService.findAll();
      return { statusCode: HttpStatus.OK, data: users };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one User by ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "User found" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "User not found" })
  async findOne(@Param("id") id: string) {
    try {
      const user = await this.usersService.findOne(+id);
      if (!user) {
        return { statusCode: HttpStatus.NOT_FOUND, message: 'User not found' };
      }
      return { statusCode: HttpStatus.OK, data: user };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete one User by ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "User successfully deleted" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "User not found" })
  async remove(@Param("id") id: string) {
    try {
      const deleted = await this.usersService.remove(+id);
      if (!deleted) {
        return { statusCode: HttpStatus.NOT_FOUND, message: 'User not found' };
      }
      return { statusCode: HttpStatus.OK, message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update one User by ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "User successfully updated" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "User not found" })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.usersService.update(+id, updateUserDto);
      if (!updatedUser) {
        return { statusCode: HttpStatus.NOT_FOUND, message: 'User not found' };
      }
      return { statusCode: HttpStatus.OK, data: updatedUser };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }
}
