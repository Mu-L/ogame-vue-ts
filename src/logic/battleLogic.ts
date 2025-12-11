import type { Fleet, Resources, BattleResult, Officer } from '@/types/game'
import { DefenseType, ShipType, OfficerType } from '@/types/game'
import { SHIPS, DEFENSES } from '@/config/gameConfig'
import * as officerLogic from './officerLogic'

/**
 * 战斗单位（舰船或防御）
 */
interface BattleUnit {
  type: ShipType | DefenseType
  count: number
  attack: number
  shield: number
  armor: number
  isShip: boolean
}

/**
 * 战斗方
 */
interface BattleSide {
  fleet: BattleUnit[]
  defense: BattleUnit[]
  totalShields: number
  totalArmor: number
}

/**
 * 准备战斗方数据
 */
const prepareBattleSide = (fleet: Partial<Fleet>, defense: Partial<Record<DefenseType, number>>, defenseBonus: number = 0): BattleSide => {
  const side: BattleSide = {
    fleet: [],
    defense: [],
    totalShields: 0,
    totalArmor: 0
  }

  // 添加舰船
  Object.entries(fleet).forEach(([shipType, count]) => {
    if (count > 0) {
      const config = SHIPS[shipType as ShipType]
      const unit: BattleUnit = {
        type: shipType as ShipType,
        count,
        attack: config.attack,
        shield: config.shield * (1 + defenseBonus / 100),
        armor: config.armor * (1 + defenseBonus / 100),
        isShip: true
      }
      side.fleet.push(unit)
      side.totalShields += unit.shield * count
      side.totalArmor += unit.armor * count
    }
  })

  // 添加防御
  Object.entries(defense).forEach(([defenseType, count]) => {
    if (count > 0) {
      const config = DEFENSES[defenseType as DefenseType]
      const unit: BattleUnit = {
        type: defenseType as DefenseType,
        count,
        attack: config.attack,
        shield: config.shield * (1 + defenseBonus / 100),
        armor: config.armor * (1 + defenseBonus / 100),
        isShip: false
      }
      side.defense.push(unit)
      side.totalShields += unit.shield * count
      side.totalArmor += unit.armor * count
    }
  })

  return side
}

/**
 * 计算一方的总攻击力
 */
const calculateTotalAttack = (side: BattleSide): number => {
  let total = 0
  side.fleet.forEach(unit => {
    total += unit.attack * unit.count
  })
  side.defense.forEach(unit => {
    total += unit.attack * unit.count
  })
  return total
}

/**
 * 执行一轮战斗
 */
const executeBattleRound = (attacker: BattleSide, defender: BattleSide): void => {
  // 攻击方对防御方造成伤害
  const attackerDamage = calculateTotalAttack(attacker)
  applyDamage(defender, attackerDamage)

  // 防御方对攻击方造成伤害
  const defenderDamage = calculateTotalAttack(defender)
  applyDamage(attacker, defenderDamage)
}

/**
 * 对一方施加伤害
 */
const applyDamage = (side: BattleSide, totalDamage: number): void => {
  let remainingDamage = totalDamage

  // 先消耗护盾
  const totalShields = side.totalShields
  if (totalShields > 0) {
    const shieldAbsorption = Math.min(remainingDamage, totalShields)
    remainingDamage -= shieldAbsorption
    side.totalShields -= shieldAbsorption
  }

  // 剩余伤害穿透护盾，破坏单位
  if (remainingDamage > 0) {
    destroyUnits(side, remainingDamage)
  }
}

/**
 * 根据伤害摧毁单位
 */
const destroyUnits = (side: BattleSide, damage: number): void => {
  let remainingDamage = damage

  // 随机选择单位摧毁
  const allUnits = [...side.fleet, ...side.defense]

  while (remainingDamage > 0 && allUnits.some(u => u.count > 0)) {
    // 随机选择一个有数量的单位
    const availableUnits = allUnits.filter(u => u.count > 0)
    if (availableUnits.length === 0) break

    const targetUnit = availableUnits[Math.floor(Math.random() * availableUnits.length)]
    if (!targetUnit) break // 安全检查

    // 计算破坏概率（伤害 / 装甲）
    const destructionChance = Math.min(remainingDamage / targetUnit.armor, 1)

    if (Math.random() < destructionChance) {
      targetUnit.count--
      side.totalArmor -= targetUnit.armor
      remainingDamage -= targetUnit.armor
    } else {
      // 未破坏，但消耗一部分伤害
      remainingDamage -= targetUnit.armor * destructionChance
    }
  }
}

/**
 * 检查战斗是否结束
 */
const isBattleOver = (attacker: BattleSide, defender: BattleSide): boolean => {
  const attackerHasUnits = attacker.fleet.some(u => u.count > 0) || attacker.defense.some(u => u.count > 0)
  const defenderHasUnits = defender.fleet.some(u => u.count > 0) || defender.defense.some(u => u.count > 0)

  return !attackerHasUnits || !defenderHasUnits
}

/**
 * 计算损失
 */
const calculateLosses = (
  initialSide: BattleSide,
  finalSide: BattleSide
): { fleet: Partial<Fleet>; defense: Partial<Record<DefenseType, number>> } => {
  const losses: { fleet: Partial<Fleet>; defense: Partial<Record<DefenseType, number>> } = {
    fleet: {},
    defense: {}
  }

  // 计算舰船损失
  initialSide.fleet.forEach((initialUnit, index) => {
    const finalUnit = finalSide.fleet[index]
    const lost = initialUnit.count - (finalUnit?.count || 0)
    if (lost > 0) {
      losses.fleet[initialUnit.type as ShipType] = lost
    }
  })

  // 计算防御损失
  initialSide.defense.forEach((initialUnit, index) => {
    const finalUnit = finalSide.defense[index]
    const lost = initialUnit.count - (finalUnit?.count || 0)
    if (lost > 0) {
      losses.defense[initialUnit.type as DefenseType] = lost
    }
  })

  return losses
}

/**
 * 计算残骸场
 */
const calculateDebrisField = (
  attackerLosses: Partial<Fleet>,
  defenderLosses: { fleet: Partial<Fleet>; defense: Partial<Record<DefenseType, number>> }
): Resources => {
  const debris: Resources = { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 }
  const debrisRate = 0.3 // 30%的残骸回收率

  // 攻击方舰船损失
  Object.entries(attackerLosses).forEach(([shipType, count]) => {
    const config = SHIPS[shipType as ShipType]
    debris.metal += config.cost.metal * count * debrisRate
    debris.crystal += config.cost.crystal * count * debrisRate
  })

  // 防御方舰船损失
  Object.entries(defenderLosses.fleet).forEach(([shipType, count]) => {
    const config = SHIPS[shipType as ShipType]
    debris.metal += config.cost.metal * count * debrisRate
    debris.crystal += config.cost.crystal * count * debrisRate
  })

  // 防御设施不产生残骸场（或产生较少）

  return debris
}

/**
 * 计算掠夺资源
 */
const calculatePlunder = (availableResources: Resources, attackerFleet: Partial<Fleet>, cargoCapacity: number): Resources => {
  // 计算攻击方剩余运载能力
  let totalCapacity = 0
  Object.entries(attackerFleet).forEach(([shipType, count]) => {
    const config = SHIPS[shipType as ShipType]
    totalCapacity += config.cargoCapacity * count
  })

  // 最多掠夺50%的资源
  const maxPlunder = Math.min(totalCapacity, cargoCapacity)
  const plunderRate = 0.5

  const plunder: Resources = {
    metal: Math.min(availableResources.metal * plunderRate, maxPlunder * 0.5),
    crystal: Math.min(availableResources.crystal * plunderRate, maxPlunder * 0.3),
    deuterium: Math.min(availableResources.deuterium * plunderRate, maxPlunder * 0.2),
    darkMatter: 0, // 暗物质无法掠夺
    energy: 0
  }

  return plunder
}

/**
 * 执行战斗模拟
 */
export const simulateBattle = (
  attackerFleet: Partial<Fleet>,
  defenderFleet: Partial<Fleet>,
  defenderDefense: Partial<Record<DefenseType, number>>,
  defenderResources: Resources,
  attackerOfficers: Record<OfficerType, Officer>,
  defenderOfficers: Record<OfficerType, Officer>
): BattleResult => {
  // 计算军官加成
  const attackerBonuses = officerLogic.calculateActiveBonuses(attackerOfficers, Date.now())
  const defenderBonuses = officerLogic.calculateActiveBonuses(defenderOfficers, Date.now())

  // 准备战斗方
  const initialAttacker = prepareBattleSide(attackerFleet, {}, attackerBonuses.defenseBonus)
  const initialDefender = prepareBattleSide(defenderFleet, defenderDefense, defenderBonuses.defenseBonus)

  // 复制战斗方用于战斗
  const attacker = JSON.parse(JSON.stringify(initialAttacker)) as BattleSide
  const defender = JSON.parse(JSON.stringify(initialDefender)) as BattleSide

  // 战斗回合（最多6回合）
  let rounds = 0
  const maxRounds = 6

  while (rounds < maxRounds && !isBattleOver(attacker, defender)) {
    executeBattleRound(attacker, defender)
    rounds++
  }

  // 计算损失
  const attackerLosses = calculateLosses(initialAttacker, attacker).fleet
  const defenderLosses = calculateLosses(initialDefender, defender)

  // 判断胜负
  let winner: 'attacker' | 'defender' | 'draw' = 'draw'
  const attackerSurvived = attacker.fleet.some(u => u.count > 0)
  const defenderSurvived = defender.fleet.some(u => u.count > 0) || defender.defense.some(u => u.count > 0)

  if (attackerSurvived && !defenderSurvived) {
    winner = 'attacker'
  } else if (!attackerSurvived && defenderSurvived) {
    winner = 'defender'
  }

  // 计算残骸场
  const debrisField = calculateDebrisField(attackerLosses, defenderLosses)

  // 计算掠夺（仅攻击方胜利时）
  const plunder =
    winner === 'attacker'
      ? calculatePlunder(defenderResources, attackerFleet, 10000)
      : { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 }

  // 生成战斗报告
  const battleResult: BattleResult = {
    id: `battle_${Date.now()}`,
    timestamp: Date.now(),
    attackerId: '',
    defenderId: '',
    attackerPlanetId: '',
    defenderPlanetId: '',
    attackerFleet,
    defenderFleet,
    defenderDefense,
    attackerLosses,
    defenderLosses,
    winner,
    plunder,
    debrisField
  }

  return battleResult
}

/**
 * 计算防御设施修复（防御有70%概率修复）
 */
export const repairDefense = (
  defenseBeforeBattle: Partial<Record<DefenseType, number>>,
  defenseAfterBattle: Partial<Record<DefenseType, number>>
): Partial<Record<DefenseType, number>> => {
  const repaired: Partial<Record<DefenseType, number>> = { ...defenseAfterBattle }

  Object.keys(defenseBeforeBattle).forEach(defenseType => {
    const before = defenseBeforeBattle[defenseType as DefenseType] || 0
    const after = defenseAfterBattle[defenseType as DefenseType] || 0
    const lost = before - after

    if (lost > 0) {
      // 70%修复概率
      const repairedCount = Math.floor(lost * 0.7)
      repaired[defenseType as DefenseType] = after + repairedCount
    }
  })

  return repaired
}
