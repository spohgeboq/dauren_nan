import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recipes')
@UseGuards(JwtAuthGuard)
export class RecipesController {
  constructor(private service: RecipesService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get('raw-materials')
  getRawMaterials() { return this.service.getRawMaterials(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Get('product/:productId')
  findByProduct(@Param('productId', ParseIntPipe) productId: number) { return this.service.findByProductId(productId); }

  @Post()
  create(@Body() dto: any) { return this.service.create(dto); }

  @Post('raw-materials')
  createRawMaterial(@Body() dto: { name: string; unit?: string; costPerUnit?: number }) { return this.service.createRawMaterial(dto); }

  @Post(':id/ingredients')
  addIngredient(@Param('id', ParseIntPipe) id: number, @Body() dto: { rawMaterialId: number; amount: number }) {
    return this.service.addIngredient(id, dto);
  }

  @Patch('ingredients/:ingredientId')
  updateIngredient(@Param('ingredientId', ParseIntPipe) ingredientId: number, @Body() dto: any) {
    return this.service.updateIngredient(ingredientId, dto);
  }

  @Delete('ingredients/:ingredientId')
  removeIngredient(@Param('ingredientId', ParseIntPipe) ingredientId: number) {
    return this.service.removeIngredient(ingredientId);
  }
}
