import { Injectable } from '@nestjs/common';
import * as GraphQLTypes from '../graphql'
import { InjectRepository } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity/coffee.entity';
import { Repository } from 'typeorm';
import { UserInputError } from '@nestjs/apollo';
import { CreateCoffeeInput } from './dto/create-coffee.input/create-coffee.input';
import { UpdateCoffeeInput } from './dto/update-coffee.input/update-coffee.input';
import { Flavor } from './entities/flavor.entity/flavor.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeesRepository:Repository<Coffee>
    @InjectRepository(Flavor)
    private readonly flavorsRepository:Repository<Flavor>
    ){}

  async findAll():Promise<Coffee[]>{
    return this.coffeesRepository.find()
  }
  async findOne(id:number):Promise<Coffee>{
    const coffee = this.coffeesRepository.findOne({where:{id}})
  if(!coffee){
    throw new UserInputError(`Coffee #${id} does not exist`)
  }
  return coffee
  }

  async create(createCoffeeInput:CreateCoffeeInput)
  :Promise<Coffee>{
    const flavors = await Promise.all(
      createCoffeeInput.flavors.map(name=>this.preloadFlavorByName(name))
    )
    const coffee = this.coffeesRepository.create({
      ...createCoffeeInput,flavors
    })
    return this.coffeesRepository.save(coffee)
  }

  async update(id:number, 
    updateCoffeeInput:UpdateCoffeeInput)
    :Promise<Coffee>{
      const flavors = updateCoffeeInput.flavors &&
      (await Promise.all(
        updateCoffeeInput.flavors.map((name)=>this.preloadFlavorByName(name))
      ))
    const coffee = await this.coffeesRepository.preload(
      {id:+id,...updateCoffeeInput,flavors})
      if(!coffee){
        throw new UserInputError(`Coffee #${id} does not exist`)
      }
      return this.coffeesRepository.save(coffee)
  }
  async remove(id:number):Promise<Coffee>{
    const coffee= await this.findOne(id)
    return this.coffeesRepository.remove(coffee)
  }

  private async preloadFlavorByName(name:string):Promise<Flavor>{
    const existingFlavor = await this.flavorsRepository.findOne({
      where:{name}
    })
    if(existingFlavor){
      return existingFlavor;
    }
    return this.flavorsRepository.create({name})
  }
}
