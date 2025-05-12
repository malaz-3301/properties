import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CornService } from './corn.service';
import { CreateCornDto } from './dto/create-corn.dto';
import { UpdateCornDto } from './dto/update-corn.dto';

@Controller('corn')
export class CornController {
  constructor(private readonly cornService: CornService) {}
}
