import type { FleetMission, Planet, Resources, Fleet, BattleResult, SpyReport, Player, Officer } from '@/types/game'
import { ShipType, DefenseType, MissionType, BuildingType, OfficerType } from '@/types/game'
import * as battleLogic from './battleLogic'
import * as moonLogic from './moonLogic'
import * as moonValidation from './moonValidation'

/**
 * 计算两个星球之间的距离
 */
export const calculateDistance = (
  from: { galaxy: number; system: number; position: number },
  to: { galaxy: number; system: number; position: number }
): number => {
  return Math.sqrt(Math.pow(to.galaxy - from.galaxy, 2) + Math.pow(to.system - from.system, 2) + Math.pow(to.position - from.position, 2))
}

/**
 * 计算飞行时间
 */
export const calculateFlightTime = (distance: number, minSpeed: number): number => {
  return Math.max(10, Math.floor((distance * 10000) / minSpeed)) // 至少10秒
}

/**
 * 创建舰队任务
 */
export const createFleetMission = (
  playerId: string,
  originPlanetId: string,
  targetPosition: { galaxy: number; system: number; position: number },
  missionType: MissionType,
  fleet: Partial<Fleet>,
  cargo: Resources,
  flightTime: number
): FleetMission => {
  const now = Date.now()
  return {
    id: `mission_${now}`,
    playerId,
    originPlanetId,
    targetPosition,
    missionType,
    fleet,
    cargo,
    departureTime: now,
    arrivalTime: now + flightTime * 1000,
    returnTime: now + flightTime * 2 * 1000,
    status: 'outbound'
  }
}

/**
 * 处理运输任务到达
 */
export const processTransportArrival = (mission: FleetMission, targetPlanet: Planet | undefined): void => {
  if (targetPlanet) {
    targetPlanet.resources.metal += mission.cargo.metal
    targetPlanet.resources.crystal += mission.cargo.crystal
    targetPlanet.resources.deuterium += mission.cargo.deuterium
    targetPlanet.resources.darkMatter += mission.cargo.darkMatter
  }
  mission.status = 'returning'
  mission.cargo = { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 }
}

/**
 * 处理攻击任务到达
 */
export const processAttackArrival = (
  mission: FleetMission,
  targetPlanet: Planet | undefined,
  attacker: Player,
  defender: Player | null,
  allPlanets: Planet[]
): { battleResult: BattleResult; moon: Planet | null } | null => {
  if (!targetPlanet || targetPlanet.ownerId === attacker.id) {
    mission.status = 'returning'
    return null
  }

  // 执行战斗
  const battleResult = battleLogic.simulateBattle(
    mission.fleet,
    targetPlanet.fleet,
    targetPlanet.defense,
    targetPlanet.resources,
    attacker.officers,
    defender?.officers || ({} as Record<OfficerType, Officer>)
  )

  // 更新战斗报告ID
  battleResult.id = `battle_${Date.now()}`
  battleResult.attackerId = attacker.id
  battleResult.defenderId = targetPlanet.ownerId || 'unknown'
  battleResult.attackerPlanetId = mission.originPlanetId
  battleResult.defenderPlanetId = targetPlanet.id

  // 如果攻击方获胜，掠夺资源已经在战斗模拟中计算
  mission.cargo = battleResult.plunder

  // 更新舰队 - 计算幸存舰船
  const survivingFleet: Partial<Fleet> = {}
  Object.entries(mission.fleet).forEach(([shipType, initialCount]) => {
    const lost = battleResult.attackerLosses[shipType as ShipType] || 0
    const surviving = initialCount - lost
    if (surviving > 0) {
      survivingFleet[shipType as ShipType] = surviving
    }
  })
  mission.fleet = survivingFleet

  // 更新目标星球舰队和防御
  Object.entries(battleResult.defenderLosses.fleet).forEach(([shipType, lost]) => {
    targetPlanet.fleet[shipType as ShipType] = Math.max(0, targetPlanet.fleet[shipType as ShipType] - lost)
  })

  Object.entries(battleResult.defenderLosses.defense).forEach(([defenseType, lost]) => {
    targetPlanet.defense[defenseType as DefenseType] = Math.max(0, targetPlanet.defense[defenseType as DefenseType] - lost)
  })

  // 防御设施修复（70%概率）
  const defenseBeforeBattle: Partial<Record<DefenseType, number>> = { ...targetPlanet.defense }
  Object.entries(battleResult.defenderLosses.defense).forEach(([defenseType, lost]) => {
    defenseBeforeBattle[defenseType as DefenseType] = (defenseBeforeBattle[defenseType as DefenseType] || 0) + lost
  })
  targetPlanet.defense = battleLogic.repairDefense(defenseBeforeBattle, targetPlanet.defense) as Record<DefenseType, number>

  // 扣除掠夺的资源
  targetPlanet.resources.metal -= battleResult.plunder.metal
  targetPlanet.resources.crystal -= battleResult.plunder.crystal
  targetPlanet.resources.deuterium -= battleResult.plunder.deuterium

  mission.status = 'returning'

  // 尝试生成月球（如果该位置还没有月球）
  let moon: Planet | null = null
  const moonCheck = moonValidation.canCreateMoon(allPlanets, targetPlanet.position, battleResult.debrisField)
  if (moonCheck.canCreate && moonCheck.chance) {
    if (moonValidation.shouldGenerateMoon(moonCheck.chance)) {
      moon = moonLogic.tryGenerateMoon(battleResult.debrisField, targetPlanet.position, targetPlanet.id, targetPlanet.ownerId || 'unknown')
    }
  }

  return { battleResult, moon }
}

/**
 * 处理殖民任务到达
 */
export const processColonizeArrival = (
  mission: FleetMission,
  targetPlanet: Planet | undefined,
  playerId: string,
  colonyNameTemplate: string = 'Colony'
): Planet | null => {
  if (targetPlanet) {
    // 位置已被占用
    mission.status = 'returning'
    return null
  }

  // 创建新殖民地
  const newPlanet: Planet = {
    id: `planet_${Date.now()}`,
    name: `${colonyNameTemplate} ${mission.targetPosition.galaxy}:${mission.targetPosition.system}:${mission.targetPosition.position}`,
    ownerId: playerId,
    position: mission.targetPosition,
    resources: { metal: 500, crystal: 500, deuterium: 0, darkMatter: 0, energy: 0 },
    buildings: {} as Record<BuildingType, number>,
    fleet: {
      [ShipType.LightFighter]: 0,
      [ShipType.HeavyFighter]: 0,
      [ShipType.Cruiser]: 0,
      [ShipType.Battleship]: 0,
      [ShipType.SmallCargo]: 0,
      [ShipType.LargeCargo]: 0,
      [ShipType.ColonyShip]: 0,
      [ShipType.Recycler]: 0,
      [ShipType.EspionageProbe]: 0,
      [ShipType.DarkMatterHarvester]: 0
    },
    defense: {
      [DefenseType.RocketLauncher]: 0,
      [DefenseType.LightLaser]: 0,
      [DefenseType.HeavyLaser]: 0,
      [DefenseType.GaussCannon]: 0,
      [DefenseType.IonCannon]: 0,
      [DefenseType.PlasmaTurret]: 0,
      [DefenseType.SmallShieldDome]: 0,
      [DefenseType.LargeShieldDome]: 0
    },
    buildQueue: [],
    lastUpdate: Date.now(),
    maxSpace: 200,
    isMoon: false
  }

  Object.values(BuildingType).forEach(building => {
    newPlanet.buildings[building] = 0
  })

  // 殖民船被消耗
  mission.fleet[ShipType.ColonyShip] = (mission.fleet[ShipType.ColonyShip] || 1) - 1
  mission.status = 'returning'

  return newPlanet
}

/**
 * 处理间谍任务到达
 */
export const processSpyArrival = (mission: FleetMission, targetPlanet: Planet | undefined, playerId: string): SpyReport | null => {
  if (!targetPlanet) {
    mission.status = 'returning'
    return null
  }

  const spyReport: SpyReport = {
    id: `spy_${Date.now()}`,
    timestamp: Date.now(),
    spyId: playerId,
    targetPlanetId: targetPlanet.id,
    targetPlayerId: targetPlanet.ownerId || 'unknown',
    resources: { ...targetPlanet.resources },
    fleet: { ...targetPlanet.fleet },
    defense: { ...targetPlanet.defense },
    buildings: { ...targetPlanet.buildings },
    technologies: {},
    detectionChance: 0.3
  }

  mission.status = 'returning'
  return spyReport
}

/**
 * 处理部署任务到达
 */
export const processDeployArrival = (mission: FleetMission, targetPlanet: Planet | undefined, playerId: string): boolean => {
  if (!targetPlanet || targetPlanet.ownerId !== playerId) {
    mission.status = 'returning'
    return false
  }

  for (const [shipType, count] of Object.entries(mission.fleet)) {
    targetPlanet.fleet[shipType as ShipType] += count
  }

  // 部署任务直接完成，不返回
  return true
}

/**
 * 处理舰队任务返回
 */
export const processFleetReturn = (mission: FleetMission, originPlanet: Planet): void => {
  // 舰船返回
  Object.entries(mission.fleet).forEach(([shipType, count]) => {
    if (count > 0) {
      originPlanet.fleet[shipType as ShipType] += count
    }
  })

  // 资源返回（掠夺物或运输货物）
  originPlanet.resources.metal += mission.cargo.metal
  originPlanet.resources.crystal += mission.cargo.crystal
  originPlanet.resources.deuterium += mission.cargo.deuterium
  originPlanet.resources.darkMatter += mission.cargo.darkMatter
}

/**
 * 更新舰队任务状态
 */
export const updateFleetMissions = (
  missions: FleetMission[],
  planets: Map<string, Planet>,
  attacker: Player,
  defender: Player | null,
  now: number
): {
  completedMissions: string[]
  battleReports: BattleResult[]
  spyReports: SpyReport[]
  newColonies: Planet[]
  newMoons: Planet[]
} => {
  const completedMissions: string[] = []
  const battleReports: BattleResult[] = []
  const spyReports: SpyReport[] = []
  const newColonies: Planet[] = []
  const newMoons: Planet[] = []

  // 获取所有星球列表（用于月球生成检查）
  const allPlanets = Array.from(planets.values())

  missions.forEach(mission => {
    const originPlanet = attacker.planets.find(p => p.id === mission.originPlanetId)

    if (mission.status === 'outbound' && now >= mission.arrivalTime) {
      // 任务到达目标
      const targetKey = `${mission.targetPosition.galaxy}:${mission.targetPosition.system}:${mission.targetPosition.position}`
      const targetPlanet = planets.get(targetKey)

      switch (mission.missionType) {
        case MissionType.Transport:
          processTransportArrival(mission, targetPlanet)
          break

        case MissionType.Attack:
          const attackResult = processAttackArrival(mission, targetPlanet, attacker, defender, allPlanets)
          if (attackResult) {
            battleReports.push(attackResult.battleResult)
            if (attackResult.moon) {
              newMoons.push(attackResult.moon)
              // 将月球添加到planets map中
              const moonKey = `${attackResult.moon.position.galaxy}:${attackResult.moon.position.system}:${attackResult.moon.position.position}`
              planets.set(moonKey, attackResult.moon)
            }
          }
          break

        case MissionType.Colonize:
          const newColony = processColonizeArrival(mission, targetPlanet, attacker.id)
          if (newColony) {
            newColonies.push(newColony)
            planets.set(targetKey, newColony)
          }
          break

        case MissionType.Spy:
          const spyReport = processSpyArrival(mission, targetPlanet, attacker.id)
          if (spyReport) {
            spyReports.push(spyReport)
          }
          break

        case MissionType.Deploy:
          const deployed = processDeployArrival(mission, targetPlanet, attacker.id)
          if (deployed) {
            completedMissions.push(mission.id)
          }
          break
      }
    }

    if (mission.status === 'returning' && mission.returnTime && now >= mission.returnTime) {
      // 舰队返回
      if (originPlanet) {
        processFleetReturn(mission, originPlanet)
      }
      completedMissions.push(mission.id)
    }
  })

  return { completedMissions, battleReports, spyReports, newColonies, newMoons }
}

/**
 * 召回舰队
 */
export const recallFleetMission = (mission: FleetMission, now: number): boolean => {
  if (mission.status !== 'outbound') return false

  const elapsedTime = now - mission.departureTime

  // 如果还在飞行途中，立即返回
  if (now < mission.arrivalTime) {
    mission.status = 'returning'
    mission.returnTime = now + elapsedTime // 返回时间等于已飞行的时间
    return true
  }

  return false
}
