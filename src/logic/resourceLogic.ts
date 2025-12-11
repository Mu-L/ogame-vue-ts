import type { Planet, Resources } from '@/types/game'
import { BuildingType } from '@/types/game'

/**
 * 计算电量产出
 */
export const calculateEnergyProduction = (
  planet: Planet,
  bonuses: {
    energyProductionBonus: number
  }
): number => {
  const solarPlantLevel = planet.buildings[BuildingType.SolarPlant] || 0
  const energyBonus = 1 + (bonuses.energyProductionBonus || 0) / 100

  // 太阳能电站每级产出：50 * 1.1^等级
  return solarPlantLevel * 50 * Math.pow(1.1, solarPlantLevel) * energyBonus
}

/**
 * 计算电量消耗
 */
export const calculateEnergyConsumption = (planet: Planet): number => {
  const metalMineLevel = planet.buildings[BuildingType.MetalMine] || 0
  const crystalMineLevel = planet.buildings[BuildingType.CrystalMine] || 0
  const deuteriumSynthesizerLevel = planet.buildings[BuildingType.DeuteriumSynthesizer] || 0

  // 矿场每级消耗：10 * 1.1^等级
  const metalConsumption = metalMineLevel * 10 * Math.pow(1.1, metalMineLevel)
  const crystalConsumption = crystalMineLevel * 10 * Math.pow(1.1, crystalMineLevel)
  const deuteriumConsumption = deuteriumSynthesizerLevel * 15 * Math.pow(1.1, deuteriumSynthesizerLevel)

  return metalConsumption + crystalConsumption + deuteriumConsumption
}

/**
 * 计算资源产量（每小时）
 */
export const calculateResourceProduction = (
  planet: Planet,
  bonuses: {
    resourceProductionBonus: number
    darkMatterProductionBonus: number
    energyProductionBonus: number
  }
): Resources => {
  const metalMineLevel = planet.buildings[BuildingType.MetalMine] || 0
  const crystalMineLevel = planet.buildings[BuildingType.CrystalMine] || 0
  const deuteriumSynthesizerLevel = planet.buildings[BuildingType.DeuteriumSynthesizer] || 0
  const darkMatterCollectorLevel = planet.buildings[BuildingType.DarkMatterCollector] || 0

  const resourceBonus = 1 + (bonuses.resourceProductionBonus || 0) / 100
  const darkMatterBonus = 1 + (bonuses.darkMatterProductionBonus || 0) / 100

  // 计算电量情况
  const energyProduction = calculateEnergyProduction(planet, { energyProductionBonus: bonuses.energyProductionBonus })
  const energyConsumption = calculateEnergyConsumption(planet)
  const energyBalance = energyProduction - energyConsumption

  // 如果电量不足，资源产量按比例减少
  const productionEfficiency = energyBalance >= 0 ? 1 : Math.max(0, energyProduction / energyConsumption)

  return {
    metal: metalMineLevel * 150 * Math.pow(1.1, metalMineLevel) * resourceBonus * productionEfficiency,
    crystal: crystalMineLevel * 100 * Math.pow(1.1, crystalMineLevel) * resourceBonus * productionEfficiency,
    deuterium: deuteriumSynthesizerLevel * 50 * Math.pow(1.1, deuteriumSynthesizerLevel) * resourceBonus * productionEfficiency,
    darkMatter: darkMatterCollectorLevel * 2.5 * Math.pow(1.1, darkMatterCollectorLevel) * darkMatterBonus,
    energy: energyBalance
  }
}

/**
 * 计算资源容量
 */
export const calculateResourceCapacity = (planet: Planet, storageCapacityBonus: number): Resources => {
  const metalStorageLevel = planet.buildings[BuildingType.MetalStorage] || 0
  const crystalStorageLevel = planet.buildings[BuildingType.CrystalStorage] || 0
  const deuteriumTankLevel = planet.buildings[BuildingType.DeuteriumTank] || 0
  const darkMatterCollectorLevel = planet.buildings[BuildingType.DarkMatterCollector] || 0

  const bonus = 1 + (storageCapacityBonus || 0) / 100

  const baseCapacity = 10000
  return {
    metal: baseCapacity * Math.pow(2, metalStorageLevel) * bonus,
    crystal: baseCapacity * Math.pow(2, crystalStorageLevel) * bonus,
    deuterium: baseCapacity * Math.pow(2, deuteriumTankLevel) * bonus,
    darkMatter: 1000 + darkMatterCollectorLevel * 100, // 暗物质容量较小
    energy: 0 // 电量不存储，实时计算
  }
}

/**
 * 更新星球资源
 */
export const updatePlanetResources = (
  planet: Planet,
  now: number,
  bonuses: {
    resourceProductionBonus: number
    darkMatterProductionBonus: number
    energyProductionBonus: number
    storageCapacityBonus: number
  }
): void => {
  const timeDiff = (now - planet.lastUpdate) / 1000 // 转换为秒

  // 计算资源产量（每小时）
  const production = calculateResourceProduction(planet, {
    resourceProductionBonus: bonuses.resourceProductionBonus,
    darkMatterProductionBonus: bonuses.darkMatterProductionBonus,
    energyProductionBonus: bonuses.energyProductionBonus
  })

  // 更新资源（转换为每秒产量）
  planet.resources.metal += (production.metal * timeDiff) / 3600
  planet.resources.crystal += (production.crystal * timeDiff) / 3600
  planet.resources.deuterium += (production.deuterium * timeDiff) / 3600
  planet.resources.darkMatter += (production.darkMatter * timeDiff) / 3600

  // 限制资源上限
  const capacity = calculateResourceCapacity(planet, bonuses.storageCapacityBonus)
  planet.resources.metal = Math.min(planet.resources.metal, capacity.metal)
  planet.resources.crystal = Math.min(planet.resources.crystal, capacity.crystal)
  planet.resources.deuterium = Math.min(planet.resources.deuterium, capacity.deuterium)
  planet.resources.darkMatter = Math.min(planet.resources.darkMatter, capacity.darkMatter)

  planet.lastUpdate = now
}

/**
 * 检查资源是否足够
 */
export const checkResourcesAvailable = (currentResources: Resources, cost: Resources): boolean => {
  return (
    currentResources.metal >= cost.metal &&
    currentResources.crystal >= cost.crystal &&
    currentResources.deuterium >= cost.deuterium &&
    currentResources.darkMatter >= cost.darkMatter
  )
}

/**
 * 扣除资源
 */
export const deductResources = (currentResources: Resources, cost: Resources): void => {
  currentResources.metal -= cost.metal
  currentResources.crystal -= cost.crystal
  currentResources.deuterium -= cost.deuterium
  currentResources.darkMatter -= cost.darkMatter
}

/**
 * 添加资源
 */
export const addResources = (currentResources: Resources, amount: Resources): void => {
  currentResources.metal += amount.metal
  currentResources.crystal += amount.crystal
  currentResources.deuterium += amount.deuterium
  currentResources.darkMatter += amount.darkMatter
}
