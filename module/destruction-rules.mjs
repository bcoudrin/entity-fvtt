export function isDestroyedByDamage(constraints, failures, maxSlots = 20) {
  const constraintCount = Array.from(constraints || []).length;
  const failureCount = Array.from(failures || []).length;
  return constraintCount + failureCount >= Number(maxSlots || 20);
}

export function successorResetUpdate() {
  return {
    name: "Nouveau PIA",
    "system.creationCompleted": false,
    "system.energy.value": 10,
    "system.resources.value": 0,
    "system.data.value": 0,
    "system.constraints": [],
    "system.failures": [],
    "system.mission.activeKey": "",
    "system.mission.name": "",
    "system.mission.aspectsRequired": 0,
    "system.mission.aspectsCurrent": 0,
    "system.expeditionNumber": 0,
    "system.notes": "",
    "system.traits.technology.value": 0,
    "system.traits.technology.abilities.computing.value": 0,
    "system.traits.technology.abilities.engineering.value": 0,
    "system.traits.technology.abilities.robotics.value": 0,
    "system.traits.analysis.value": 0,
    "system.traits.analysis.abilities.biology.value": 0,
    "system.traits.analysis.abilities.chemistry.value": 0,
    "system.traits.analysis.abilities.physics.value": 0,
    "system.traits.adaptability.value": 0,
    "system.traits.adaptability.abilities.communication.value": 0,
    "system.traits.adaptability.abilities.navigation.value": 0,
    "system.traits.adaptability.abilities.survival.value": 0
  };
}
