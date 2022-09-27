import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { Accounted } from "../account.entity";
import { AdminService } from "./admin.service";

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    // @Post()
    // create(@Body() createAdminDto: CreateAdminDto) {
    //     return this.adminService.create(createAdminDto);
    // }


    @Delete('/:id')
    deleteAccountById(@Param("id", ParseIntPipe) id : number): Promise <void> {
        return this.adminService.deleteAccountById(id);
    }
}