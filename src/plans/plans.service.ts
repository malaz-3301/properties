import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { DataSource, In, Not, Repository } from 'typeorm';
import { UsersGetProvider } from '../users/providers/users-get.provider';
import { PlanType } from '../utils/enums';
import { Property } from '../properties/entities/property.entity';
import { Language } from 'src/utils/enums';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private readonly usersGetProvider: UsersGetProvider,
    private dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async create(createPlanDto: CreatePlanDto) {
    if (createPlanDto.description) {
      createPlanDto['ar_description'] = createPlanDto.description;
      createPlanDto['en_description'] = await this.translate(
        Language.ENGLISH,
        createPlanDto.description,
      );
    }
    return this.planRepository.save({ ...createPlanDto });
  }

  async create_back_planes() {
    await this.dataSource.query(`
    TRUNCATE TABLE "plans" RESTART IDENTITY CASCADE;
  `);
    const plans = [
      {
        planDuration: 'Other',
        ar_description: 'مجانية',
        en_description: 'Free',
        planType: PlanType.BASIC,
        limit: 0,
        planPrice: 0,
      },
      {
        planDuration: '1_day',
        ar_description: 'تجربة',
        en_description: 'Trial',
        planType: PlanType.TRIAL,
        limit: 1,
        planPrice: 0,
      },
      {
        planDuration: '3_month',
        ar_description:
          'تتيح الخطة البلاتينية للمشتركين نشر ثلاثين عقار و تمتد ثلاث شهور 💎',
        en_description:
          'Platinum plan allows users to post thirty properties and extends for three months 💎',
        planType: PlanType.Platinum,
        limit: 30,
        planPrice: 9,
      },
      {
        planDuration: '10_month',
        ar_description: 'تقدم لك خطة Vip نشر ثمانين عقار و تمتد لعشر شهور 🏅',
        en_description:
          'Vip plan offers you eighty properties for ten months. 🏅',

        planType: PlanType.VIP,
        limit: 0,
        planPrice: 19,
      },
    ];
    const entities = this.planRepository.create(plans);
    return this.planRepository.save(entities);
  }

  async update(id: number, updatePlanDto: UpdatePlanDto) {
    const plan = await this.planRepository.findOneBy({ id: id });
    if (!plan) {
      throw new NotFoundException();
    }
    if (updatePlanDto.description) {
      plan['ar_description'] = updatePlanDto.description;
      plan['en_description'] = await this.translate(
        Language.ENGLISH,
        updatePlanDto.description,
      );
    }
    const temp = { ...plan, ...updatePlanDto };
    return this.planRepository.save({ ...temp });
  }

  async findAll(userId: number) {
    const user = await this.usersGetProvider.findById(userId);
    //ارجاع الخطة اذا منتهية
    const count = await this.propertyRepository.count({
      where: {
        agency: { id: userId },
      },
    });

    //اذا لسا ما تجاوز الحد لا تعرض خطته
    const planId = count < user.plan?.limit! ? user.plan?.id : 0;

    //شفلي اذا مستخدم الtrial من قبل رجعلي الخطط يلي مو trial
    let where;
    if (user.hasUsedTrial) {
      where = { id: Not(In([1, 2, planId])) };
    } else {
      //شيل بس الـ Free
      where = { id: Not(In([1, planId])) };
    }
    const plans = await this.planRepository.find({
      where: where,
    });
    if (user.language == Language.ARABIC) {
      plans.forEach(function (plan) {
        plan['description'] = plan.ar_description;
      });
    } else {
      plans.forEach(function (plan) {
        plan['description'] = plan.en_description;
      });
    }
    return plans;
  }

  async translate(targetLang: Language, text: string) {
    const Url = this.configService.get<string>('TRANSLATE');
    const sourceLang = Language.ARABIC;
    const Url1 =
      Url +
      `?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    let translatedText;
    await fetch(Url1)
      .then((response) => response.json())
      .then((data) => {
        translatedText = data[0][0][0];
      })
      .catch((error) => {
        console.error('حدث خطأ:', error);
        console.log(Url1);
      });
    return translatedText;
  }
}
