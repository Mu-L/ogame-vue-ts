import { BuildingType, TechnologyType, ShipType, DefenseType, OfficerType } from '@/types/game'
import type { BuildingConfig, TechnologyConfig, ShipConfig, DefenseConfig, OfficerConfig } from '@/types/game'

// 建筑配置数据
export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.MetalMine]: {
    id: BuildingType.MetalMine,
    name: '金属矿',
    description: '开采金属资源',
    baseCost: { metal: 60, crystal: 15, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 1.5,
    spaceUsage: 3,
    planetOnly: true
  },
  [BuildingType.CrystalMine]: {
    id: BuildingType.CrystalMine,
    name: '晶体矿',
    description: '开采晶体资源',
    baseCost: { metal: 48, crystal: 24, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 1.6,
    spaceUsage: 3,
    planetOnly: true
  },
  [BuildingType.DeuteriumSynthesizer]: {
    id: BuildingType.DeuteriumSynthesizer,
    name: '重氢合成器',
    description: '合成重氢资源',
    baseCost: { metal: 225, crystal: 75, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 20, // 减少建造时间：30→20秒
    costMultiplier: 1.5,
    spaceUsage: 4,
    planetOnly: true
  },
  [BuildingType.SolarPlant]: {
    id: BuildingType.SolarPlant,
    name: '太阳能电站',
    description: '提供能源',
    baseCost: { metal: 75, crystal: 30, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 1.5,
    spaceUsage: 5
  },
  [BuildingType.RoboticsFactory]: {
    id: BuildingType.RoboticsFactory,
    name: '机器人工厂',
    description: '加快建造速度',
    baseCost: { metal: 400, crystal: 120, deuterium: 200, darkMatter: 0, energy: 0 },
    baseTime: 40, // 减少建造时间：60→40秒
    costMultiplier: 2,
    spaceUsage: 6
  },
  [BuildingType.NaniteFactory]: {
    id: BuildingType.NaniteFactory,
    name: '纳米工厂',
    description: '增加建造队列数量，每级+1队列',
    baseCost: { metal: 1000000, crystal: 500000, deuterium: 100000, darkMatter: 0, energy: 0 },
    baseTime: 240, // 减少建造时间：300→240秒
    costMultiplier: 2,
    spaceUsage: 15,
    requirements: { [BuildingType.RoboticsFactory]: 10 }
  },
  [BuildingType.Shipyard]: {
    id: BuildingType.Shipyard,
    name: '船坞',
    description: '建造舰船',
    baseCost: { metal: 400, crystal: 200, deuterium: 100, darkMatter: 0, energy: 0 },
    baseTime: 30, // 减少建造时间：60→30秒
    costMultiplier: 2,
    spaceUsage: 8
  },
  [BuildingType.ResearchLab]: {
    id: BuildingType.ResearchLab,
    name: '研究实验室',
    description: '研究科技',
    baseCost: { metal: 200, crystal: 400, deuterium: 200, darkMatter: 0, energy: 0 },
    baseTime: 30, // 减少建造时间：60→30秒
    costMultiplier: 2,
    spaceUsage: 5
  },
  [BuildingType.MetalStorage]: {
    id: BuildingType.MetalStorage,
    name: '金属仓库',
    description: '增加金属存储上限',
    baseCost: { metal: 1000, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 2,
    spaceUsage: 2
  },
  [BuildingType.CrystalStorage]: {
    id: BuildingType.CrystalStorage,
    name: '晶体仓库',
    description: '增加晶体存储上限',
    baseCost: { metal: 1000, crystal: 500, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 2,
    spaceUsage: 2
  },
  [BuildingType.DeuteriumTank]: {
    id: BuildingType.DeuteriumTank,
    name: '重氢罐',
    description: '增加重氢存储上限',
    baseCost: { metal: 1000, crystal: 1000, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 2,
    spaceUsage: 2
  },
  [BuildingType.DarkMatterCollector]: {
    id: BuildingType.DarkMatterCollector,
    name: '暗物质收集器',
    description: '收集稀有的暗物质资源',
    baseCost: { metal: 50000, crystal: 100000, deuterium: 50000, darkMatter: 0, energy: 0 },
    baseTime: 90, // 减少建造时间：120→90秒
    costMultiplier: 2,
    spaceUsage: 10,
    planetOnly: true
  },
  // 月球专属建筑
  [BuildingType.LunarBase]: {
    id: BuildingType.LunarBase,
    name: '月球基地',
    description: '增加月球可用空间',
    baseCost: { metal: 20000, crystal: 40000, deuterium: 20000, darkMatter: 0, energy: 0 },
    baseTime: 45, // 减少建造时间：60→45秒
    costMultiplier: 2,
    spaceUsage: 0, // 月球基地本身不占用空间,反而增加空间
    moonOnly: true
  },
  [BuildingType.SensorPhalanx]: {
    id: BuildingType.SensorPhalanx,
    name: '传感器阵列',
    description: '侦测周围星系的舰队活动',
    baseCost: { metal: 20000, crystal: 40000, deuterium: 20000, darkMatter: 0, energy: 0 },
    baseTime: 60, // 减少建造时间：90→60秒
    costMultiplier: 2,
    spaceUsage: 10,
    moonOnly: true
  },
  [BuildingType.JumpGate]: {
    id: BuildingType.JumpGate,
    name: '跳跃门',
    description: '瞬间传送舰队到其他月球',
    baseCost: { metal: 2000000, crystal: 4000000, deuterium: 2000000, darkMatter: 0, energy: 0 },
    baseTime: 240, // 减少建造时间：300→240秒
    costMultiplier: 2,
    spaceUsage: 20,
    moonOnly: true
  }
}

// 科技配置数据
export const TECHNOLOGIES: Record<TechnologyType, TechnologyConfig> = {
  [TechnologyType.EnergyTechnology]: {
    id: TechnologyType.EnergyTechnology,
    name: '能源技术',
    description: '提高能源利用效率',
    baseCost: { metal: 0, crystal: 800, deuterium: 400, darkMatter: 0, energy: 0 },
    baseTime: 30, // 减少研究时间：60→30秒
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 1 }
  },
  [TechnologyType.LaserTechnology]: {
    id: TechnologyType.LaserTechnology,
    name: '激光技术',
    description: '开发激光武器',
    baseCost: { metal: 200, crystal: 100, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 1, [TechnologyType.EnergyTechnology]: 2 }
  },
  [TechnologyType.IonTechnology]: {
    id: TechnologyType.IonTechnology,
    name: '离子技术',
    description: '开发离子武器',
    baseCost: { metal: 1000, crystal: 300, deuterium: 100, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 4, [TechnologyType.LaserTechnology]: 5, [TechnologyType.EnergyTechnology]: 4 }
  },
  [TechnologyType.HyperspaceTechnology]: {
    id: TechnologyType.HyperspaceTechnology,
    name: '超空间技术',
    description: '研究超空间跳跃',
    baseCost: { metal: 0, crystal: 4000, deuterium: 2000, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 7, [TechnologyType.EnergyTechnology]: 5 }
  },
  [TechnologyType.PlasmaTechnology]: {
    id: TechnologyType.PlasmaTechnology,
    name: '等离子技术',
    description: '开发等离子武器',
    baseCost: { metal: 2000, crystal: 4000, deuterium: 1000, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: {
      [BuildingType.ResearchLab]: 4,
      [TechnologyType.EnergyTechnology]: 8,
      [TechnologyType.LaserTechnology]: 10,
      [TechnologyType.IonTechnology]: 5
    }
  },
  [TechnologyType.ComputerTechnology]: {
    id: TechnologyType.ComputerTechnology,
    name: '计算机技术',
    description: '增加研究队列数量，每级+1队列',
    baseCost: { metal: 0, crystal: 400, deuterium: 600, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 1 }
  },
  [TechnologyType.CombustionDrive]: {
    id: TechnologyType.CombustionDrive,
    name: '燃烧引擎',
    description: '基础推进系统',
    baseCost: { metal: 400, crystal: 0, deuterium: 600, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 1, [TechnologyType.EnergyTechnology]: 1 }
  },
  [TechnologyType.ImpulseDrive]: {
    id: TechnologyType.ImpulseDrive,
    name: '脉冲引擎',
    description: '高级推进系统',
    baseCost: { metal: 2000, crystal: 4000, deuterium: 600, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 2, [TechnologyType.EnergyTechnology]: 1 }
  },
  [TechnologyType.HyperspaceDrive]: {
    id: TechnologyType.HyperspaceDrive,
    name: '超空间引擎',
    description: '超空间推进系统',
    baseCost: { metal: 10000, crystal: 20000, deuterium: 6000, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 7, [TechnologyType.HyperspaceTechnology]: 3 }
  },
  [TechnologyType.DarkMatterTechnology]: {
    id: TechnologyType.DarkMatterTechnology,
    name: '暗物质技术',
    description: '研究暗物质的性质和应用',
    baseCost: { metal: 100000, crystal: 200000, deuterium: 100000, darkMatter: 0, energy: 0 },
    baseTime: 180,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 8, [TechnologyType.HyperspaceTechnology]: 5 }
  }
}

// 舰船配置数据
export const SHIPS: Record<ShipType, ShipConfig> = {
  [ShipType.LightFighter]: {
    id: ShipType.LightFighter,
    name: '轻型战斗机',
    description: '基础战斗单位',
    cost: { metal: 3000, crystal: 1000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 20,
    cargoCapacity: 50,
    attack: 50,
    shield: 10,
    armor: 400,
    speed: 12500,
    fuelConsumption: 20,
    requirements: { [BuildingType.Shipyard]: 1, [TechnologyType.CombustionDrive]: 1 }
  },
  [ShipType.HeavyFighter]: {
    id: ShipType.HeavyFighter,
    name: '重型战斗机',
    description: '强力战斗单位',
    cost: { metal: 6000, crystal: 4000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 30,
    cargoCapacity: 100,
    attack: 150,
    shield: 25,
    armor: 1000,
    speed: 10000,
    fuelConsumption: 75,
    requirements: { [BuildingType.Shipyard]: 3, [TechnologyType.ImpulseDrive]: 2 }
  },
  [ShipType.Cruiser]: {
    id: ShipType.Cruiser,
    name: '巡洋舰',
    description: '中型战舰',
    cost: { metal: 20000, crystal: 7000, deuterium: 2000, darkMatter: 0, energy: 0 },
    buildTime: 60,
    cargoCapacity: 800,
    attack: 400,
    shield: 50,
    armor: 2700,
    speed: 15000,
    fuelConsumption: 300,
    requirements: { [BuildingType.Shipyard]: 5, [TechnologyType.ImpulseDrive]: 4, [TechnologyType.IonTechnology]: 2 }
  },
  [ShipType.Battleship]: {
    id: ShipType.Battleship,
    name: '战列舰',
    description: '重型战舰',
    cost: { metal: 45000, crystal: 15000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 90,
    cargoCapacity: 1500,
    attack: 1000,
    shield: 200,
    armor: 6000,
    speed: 10000,
    fuelConsumption: 500,
    requirements: { [BuildingType.Shipyard]: 7, [TechnologyType.HyperspaceDrive]: 4 }
  },
  [ShipType.SmallCargo]: {
    id: ShipType.SmallCargo,
    name: '小型运输船',
    description: '运输资源',
    cost: { metal: 2000, crystal: 2000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 15,
    cargoCapacity: 5000,
    attack: 5,
    shield: 10,
    armor: 400,
    speed: 5000,
    fuelConsumption: 10,
    requirements: { [BuildingType.Shipyard]: 2, [TechnologyType.CombustionDrive]: 2 }
  },
  [ShipType.LargeCargo]: {
    id: ShipType.LargeCargo,
    name: '大型运输船',
    description: '大量运输资源',
    cost: { metal: 6000, crystal: 6000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 30,
    cargoCapacity: 25000,
    attack: 5,
    shield: 25,
    armor: 1200,
    speed: 7500,
    fuelConsumption: 50,
    requirements: { [BuildingType.Shipyard]: 4, [TechnologyType.CombustionDrive]: 6 }
  },
  [ShipType.ColonyShip]: {
    id: ShipType.ColonyShip,
    name: '殖民船',
    description: '建立新殖民地',
    cost: { metal: 10000, crystal: 20000, deuterium: 10000, darkMatter: 0, energy: 0 },
    buildTime: 120,
    cargoCapacity: 7500,
    attack: 50,
    shield: 100,
    armor: 3000,
    speed: 2500,
    fuelConsumption: 1000,
    requirements: { [BuildingType.Shipyard]: 4, [TechnologyType.ImpulseDrive]: 3 }
  },
  [ShipType.Recycler]: {
    id: ShipType.Recycler,
    name: '回收船',
    description: '回收废墟资源',
    cost: { metal: 10000, crystal: 6000, deuterium: 2000, darkMatter: 0, energy: 0 },
    buildTime: 60,
    cargoCapacity: 20000,
    attack: 1,
    shield: 10,
    armor: 1600,
    speed: 2000,
    fuelConsumption: 300,
    requirements: { [BuildingType.Shipyard]: 4, [TechnologyType.CombustionDrive]: 6 }
  },
  [ShipType.EspionageProbe]: {
    id: ShipType.EspionageProbe,
    name: '间谍探测器',
    description: '侦察敌方星球',
    cost: { metal: 0, crystal: 1000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 5,
    cargoCapacity: 5,
    attack: 0,
    shield: 0,
    armor: 100,
    speed: 100000000,
    fuelConsumption: 1,
    requirements: { [BuildingType.Shipyard]: 3, [TechnologyType.CombustionDrive]: 3 }
  },
  [ShipType.DarkMatterHarvester]: {
    id: ShipType.DarkMatterHarvester,
    name: '暗物质采集船',
    description: '专门用于采集暗物质的特殊飞船',
    cost: { metal: 100000, crystal: 150000, deuterium: 50000, darkMatter: 0, energy: 0 },
    buildTime: 120,
    cargoCapacity: 1000, // 暗物质专用储存
    attack: 10,
    shield: 50,
    armor: 2000,
    speed: 5000,
    fuelConsumption: 500,
    requirements: {
      [BuildingType.Shipyard]: 8,
      [TechnologyType.HyperspaceDrive]: 5,
      [TechnologyType.DarkMatterTechnology]: 1
    }
  }
}

// 防御设施配置数据
export const DEFENSES: Record<DefenseType, DefenseConfig> = {
  [DefenseType.RocketLauncher]: {
    id: DefenseType.RocketLauncher,
    name: '火箭发射器',
    description: '基础防御设施',
    cost: { metal: 2000, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 10,
    attack: 80,
    shield: 20,
    armor: 200,
    requirements: { [BuildingType.Shipyard]: 1 }
  },
  [DefenseType.LightLaser]: {
    id: DefenseType.LightLaser,
    name: '轻型激光炮',
    description: '激光防御武器',
    cost: { metal: 1500, crystal: 500, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 12,
    attack: 100,
    shield: 25,
    armor: 200,
    requirements: { [BuildingType.Shipyard]: 2, [TechnologyType.LaserTechnology]: 3 }
  },
  [DefenseType.HeavyLaser]: {
    id: DefenseType.HeavyLaser,
    name: '重型激光炮',
    description: '强力激光武器',
    cost: { metal: 6000, crystal: 2000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 20,
    attack: 250,
    shield: 100,
    armor: 800,
    requirements: { [BuildingType.Shipyard]: 4, [TechnologyType.LaserTechnology]: 6 }
  },
  [DefenseType.GaussCannon]: {
    id: DefenseType.GaussCannon,
    name: '高斯炮',
    description: '电磁加速武器',
    cost: { metal: 20000, crystal: 15000, deuterium: 2000, darkMatter: 0, energy: 0 },
    buildTime: 35,
    attack: 1100,
    shield: 200,
    armor: 3500,
    requirements: { [BuildingType.Shipyard]: 6, [TechnologyType.EnergyTechnology]: 6 }
  },
  [DefenseType.IonCannon]: {
    id: DefenseType.IonCannon,
    name: '离子炮',
    description: '离子武器系统',
    cost: { metal: 2000, crystal: 6000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 30,
    attack: 150,
    shield: 500,
    armor: 800,
    requirements: { [BuildingType.Shipyard]: 4, [TechnologyType.IonTechnology]: 4 }
  },
  [DefenseType.PlasmaTurret]: {
    id: DefenseType.PlasmaTurret,
    name: '等离子炮台',
    description: '最强防御武器',
    cost: { metal: 50000, crystal: 50000, deuterium: 30000, darkMatter: 0, energy: 0 },
    buildTime: 60,
    attack: 3000,
    shield: 300,
    armor: 10000,
    requirements: { [BuildingType.Shipyard]: 8, [TechnologyType.PlasmaTechnology]: 7 }
  },
  [DefenseType.SmallShieldDome]: {
    id: DefenseType.SmallShieldDome,
    name: '小型护盾罩',
    description: '保护星球的能量护盾',
    cost: { metal: 10000, crystal: 10000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 30,
    attack: 1,
    shield: 2000,
    armor: 2000,
    requirements: { [BuildingType.Shipyard]: 6, [TechnologyType.EnergyTechnology]: 3 }
  },
  [DefenseType.LargeShieldDome]: {
    id: DefenseType.LargeShieldDome,
    name: '大型护盾罩',
    description: '强大的星球护盾',
    cost: { metal: 50000, crystal: 50000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 60,
    attack: 1,
    shield: 10000,
    armor: 10000,
    requirements: { [BuildingType.Shipyard]: 6, [TechnologyType.EnergyTechnology]: 6 }
  }
}

// 军官配置数据
export const OFFICERS: Record<OfficerType, OfficerConfig> = {
  [OfficerType.Commander]: {
    id: OfficerType.Commander,
    name: '指挥官',
    description: '提升建筑速度和管理能力',
    cost: { metal: 0, crystal: 50000, deuterium: 25000, darkMatter: 0, energy: 0 },
    weeklyMaintenance: { metal: 0, crystal: 5000, deuterium: 2500, darkMatter: 0, energy: 0 },
    benefits: {
      buildingSpeedBonus: 10, // 建筑速度 +10%
      additionalBuildQueue: 1, // 额外1个建筑队列
      storageCapacityBonus: 10 // 仓储容量 +10%
    }
  },
  [OfficerType.Admiral]: {
    id: OfficerType.Admiral,
    name: '上将',
    description: '提升舰队作战能力',
    cost: { metal: 50000, crystal: 25000, deuterium: 0, darkMatter: 0, energy: 0 },
    weeklyMaintenance: { metal: 5000, crystal: 2500, deuterium: 0, darkMatter: 0, energy: 0 },
    benefits: {
      additionalFleetSlots: 2, // 额外2个舰队槽位
      fleetSpeedBonus: 10, // 舰队速度 +10%
      fuelConsumptionReduction: 10 // 燃料消耗 -10%
    }
  },
  [OfficerType.Engineer]: {
    id: OfficerType.Engineer,
    name: '工程师',
    description: '增强防御和能量系统',
    cost: { metal: 40000, crystal: 20000, deuterium: 10000, darkMatter: 0, energy: 0 },
    weeklyMaintenance: { metal: 4000, crystal: 2000, deuterium: 1000, darkMatter: 0, energy: 0 },
    benefits: {
      defenseBonus: 15, // 防御力 +15%
      energyProductionBonus: 10, // 电量产出 +10%
      buildingSpeedBonus: 5 // 建筑速度 +5%
    }
  },
  [OfficerType.Geologist]: {
    id: OfficerType.Geologist,
    name: '地质学家',
    description: '提高资源开采效率',
    cost: { metal: 30000, crystal: 30000, deuterium: 20000, darkMatter: 0, energy: 0 },
    weeklyMaintenance: { metal: 3000, crystal: 3000, deuterium: 2000, darkMatter: 0, energy: 0 },
    benefits: {
      resourceProductionBonus: 15, // 资源产量 +15%
      storageCapacityBonus: 10 // 仓储容量 +10%
    }
  },
  [OfficerType.Technocrat]: {
    id: OfficerType.Technocrat,
    name: '技术专家',
    description: '加快科技研究速度',
    cost: { metal: 20000, crystal: 40000, deuterium: 20000, darkMatter: 0, energy: 0 },
    weeklyMaintenance: { metal: 2000, crystal: 4000, deuterium: 2000, darkMatter: 0, energy: 0 },
    benefits: {
      researchSpeedBonus: 15 // 研究速度 +15%
    }
  },
  [OfficerType.DarkMatterSpecialist]: {
    id: OfficerType.DarkMatterSpecialist,
    name: '暗物质专家',
    description: '提升暗物质采集效率',
    cost: { metal: 50000, crystal: 100000, deuterium: 50000, darkMatter: 100, energy: 0 },
    weeklyMaintenance: { metal: 5000, crystal: 10000, deuterium: 5000, darkMatter: 10, energy: 0 },
    benefits: {
      darkMatterProductionBonus: 25 // 暗物质产量 +25%
    }
  }
}

// 月球配置
export const MOON_CONFIG = {
  minDebrisField: 100000, // 最小残骸场 (金属+晶体)
  baseChance: 1, // 基础1%概率
  maxChance: 20, // 最大20%概率
  chancePerDebris: 100000, // 每10万资源增加1%概率
  baseSize: 100, // 月球基础空间
  lunarBaseSpaceBonus: 3 // 每级月球基地增加的空间
}
