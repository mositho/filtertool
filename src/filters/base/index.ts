import rule from '../../rule'
import type { StyleData } from '../../types'

const SOUND_FOLDER = 'allex-sounds/'

const STYLE: Record<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H', StyleData> = {
  A: { text: [0, 168, 255], background: [255, 255, 255], border: [0, 168, 255], size: 45 },
  B: { text: [255, 255, 255], background: [0, 168, 255], border: [255, 255, 255], size: 45 },
  C: { text: [0, 255, 255], background: [0, 0, 0], border: [0, 255, 255], size: 45 },
  D: { text: [0, 255, 0], background: [0, 50, 0], border: [0, 255, 0], size: 45 },
  E: { text: [0, 255, 0], background: [0, 0, 0], border: [0, 255, 0], size: 45 },
  F: { text: [210, 100, 100], background: [0, 0, 0], border: [210, 100, 100], size: 45 },
  G: { text: [100, 150, 210], background: [0, 0, 0], border: [100, 150, 210], size: 45 },
  H: { text: [50, 200, 125], background: [0, 50, 40], border: [50, 200, 125], size: 45 },
}

// Filter entry point exports a getFilter function to be called by the export script
export const getFilter = () => `
### Twilight strand
${rule().baseType('Rusted Sword', 'Crude Bow', 'Glass Shank', 'Driftwood Wand', 'Driftwood Club', 'Driftwood Sceptre').areaLevel('==', 1).size(45).compile()}
${rule().itemClass('Gems').areaLevel('==', 1).size(45).compile()}

### Currency

# Gold

${rule().itemClass('Gold').stackSize('>=', 50).background(0, 0, 0, 200).border(0, 0, 0).size(25).compile()}

${rule().itemClass('Gold').background(0, 0, 0, 100).border(0, 0, 0).size(25).compile()}


# A Tier

${rule().baseType('Mirror of Kalandra', 'Divine Orb').icon('Red', 'Star').style(STYLE.A).sound(6).compile()}

${rule().baseType('Orb of Annulment').icon('Red', 'Circle').style(STYLE.A).sound(1).compile()}

# B Tier

${rule().baseType('Exalted Orb').icon('Pink', 'Circle').style(STYLE.B).sound(1).compile()}

${rule().baseType('Regal Orb').icon('Pink', 'Hexagon').style(STYLE.B).customSound(`${SOUND_FOLDER}regal.mp3`).compile()}

${rule().baseType('Orb of Chance').icon('Pink', 'Square').style(STYLE.B).customSound(`${SOUND_FOLDER}chance.mp3`).compile()}

${rule().baseType('Orb of Binding').icon('Pink', 'Diamond').style(STYLE.B).customSound(`${SOUND_FOLDER}binding.mp3`).compile()}

${rule().baseType('Orb of Scouring').icon('Yellow', 'Square').style(STYLE.B).customSound(`${SOUND_FOLDER}scour.mp3`).compile()}

${rule().baseType('Orb of Alchemy').icon('Yellow', 'Hexagon').style(STYLE.B).customSound(`${SOUND_FOLDER}alchemy.mp3`).compile()}

${rule().baseType('Orb of Alteration').icon('Yellow', 'Circle').style(STYLE.B).customSound(`${SOUND_FOLDER}alt.mp3`).compile()}

${rule().baseType('Vaal Orb').icon('Orange', 'Hexagon').style(STYLE.B).customSound(`${SOUND_FOLDER}vaal.mp3`).compile()}

${rule().baseType('Chaos Orb').icon('Orange', 'Circle').style(STYLE.B).customSound(`${SOUND_FOLDER}chaos.mp3`).compile()}

${rule().baseType('Orb of Regret').icon('Orange', 'Square').style(STYLE.B).customSound(`${SOUND_FOLDER}regret.mp3`).compile()}

## C Tier Currency

${rule().baseType('Orb of Fusing').icon('Yellow', 'Diamond').style(STYLE.C).customSound(`${SOUND_FOLDER}fusing.mp3`).compile()}

${rule().baseType("Jeweller's Orb").icon('Yellow', 'Diamond').style(STYLE.C).customSound(`${SOUND_FOLDER}jeweller.mp3`).compile()}
  
${rule().baseType('Chromatic Orb').icon('Purple', 'Pentagon').style(STYLE.C).customSound(`${SOUND_FOLDER}chromatic.mp3`).compile()}

${rule().baseType("Armourer's Scrap").icon('White', 'Square').style(STYLE.C).customSound(`${SOUND_FOLDER}scrap.mp3`).compile()}

${rule().baseType('Orb of Augmentation').icon('White', 'Circle').style(STYLE.C).customSound(`${SOUND_FOLDER}augment.mp3`).compile()}

${rule().baseType('Orb of Transmutation').icon('Cyan', 'Hexagon').style(STYLE.C).customSound(`${SOUND_FOLDER}trans.mp3`).compile()}

${rule().baseType("Blacksmith's Whetstone").icon('Cyan', 'Kite').style(STYLE.C).customSound(`${SOUND_FOLDER}whet.mp3`).compile()}

${rule().baseType('Essence').icon('Pink', 'Circle').style(STYLE.C).sound(2).compile()}

# League Start Currency (Disable for A5/10)

${rule()
  .baseType(
    'Veiled Chaos Orb',
    'Exalted Shard',
    'Enkindling Orb',
    'Instilling Orb',
    "Glassblower's Bauble",
    "Gemcutter's Prism",
    "Cartographer's Chisel",
    'Annulment Shard',
    'Ancient Orb',
    'Ancient Shard',
    'Sacred Orb',
    'Chaos Shard',
    'Scouting Report',
    'Blessed Orb',
    'Orb of Horizons',
    'Horizon Shard',
    "Harbinger's Orb",
    "Harbinger's Shard",
    'Catalyst',
    'Fossil',
    'Oil',
    'Splinter',
    'Remnant of Corruption',
    'Ichor',
    'Ember',
    'Lifeforce',
    'Blessing',
    'Alchemy Shard',
    'Omen',
    'Tattoo',
  )
  .icon('Blue', 'Circle')
  .style(STYLE.C)
  .compile()}


# Wisdom/Portal

${rule()
  .baseType('Scroll of Wisdom')
  .areaLevel('<=', 38)
  .icon('Brown', 'Circle')
  .customSound(`${SOUND_FOLDER}wisdom.mp3`)
  .text(200, 130, 105)
  .background(0, 0, 0)
  .border(200, 140, 100, 100)
  .size(45)
  .compile()}

${rule()
  .baseType('Scroll of Wisdom')
  .icon('Brown', 'Circle')
  .text(200, 130, 105)
  .background(0, 0, 0)
  .border(200, 140, 100, 100)
  .size(45)
  .compile()}

${rule()
  .baseType('Portal Scroll')
  .areaLevel('<=', 38)
  .icon('Blue', 'Circle')
  .customSound(`${SOUND_FOLDER}portal.mp3`)
  .text(100, 130, 205)
  .background(0, 0, 0)
  .border(100, 140, 200, 100)
  .size(45)
  .compile()}

${rule()
  .baseType('Portal Scroll')
  .icon('Blue', 'Circle')
  .text(100, 130, 205)
  .background(0, 0, 0)
  .border(100, 140, 200, 100)
  .size(45)
  .compile()}

### Uniques

# ALL
${rule().rarity('==', 'Unique').icon('Brown', 'Star').text(255, 68, 0).background(0, 0, 0).border(255, 68, 0).size(45).compile()}


### Gems

${rule().itemClass('Skill Gems', 'Support Gems').baseType('Empower', 'Enlighten', 'Enhance').icon('Red', 'Star').compile()}

${rule().itemClass('Skill Gems').baseType('Vaal').icon('Cyan', 'Triangle').text(0, 255, 255).background(45, 0, 20).border(0, 255, 255).size(45).compile()}

${rule().itemClass('Skill Gems', 'Support Gems').text(0, 255, 255).size(35).compile()}


### Links

## 6 Links

${rule().linkedSockets('=', 6).icon('Red', 'Diamond').text(0, 168, 0).background(255, 255, 255).border(0, 168, 0).size(45).customSound(`${SOUND_FOLDER}6_link.mp3`).compile()}

## 5 Links

${rule().linkedSockets('=', 5).icon('Orange', 'Diamond').style(STYLE.B).customSound(`${SOUND_FOLDER}5_link.mp3`).compile()}

## 4 Links

# RRRR
${rule().itemClass('Body Armours').socketGroup('==', 'RRRR').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4red_body.mp3`).compile()}

${rule().itemClass('Gloves').socketGroup('==', 'RRRR').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4red_gloves.mp3`).compile()}

${rule().itemClass('Boots').socketGroup('==', 'RRRR').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4red_boots.mp3`).compile()}

${rule().itemClass('Helmets').socketGroup('==', 'RRRR').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4red_helm.mp3`).compile()}

# RRRG
${rule().itemClass('Body Armours').socketGroup('==', 'RRRG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3red1g_body.mp3`).compile()}

${rule().itemClass('Gloves').socketGroup('==', 'RRRG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3red1g_gloves.mp3`).compile()}

${rule().itemClass('Boots').socketGroup('==', 'RRRG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3red1g_boots.mp3`).compile()}

${rule().itemClass('Helmets').socketGroup('==', 'RRRG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3red1g_helm.mp3`).compile()}

# RRRB
${false ? rule().itemClass('Body Armours').socketGroup('==', 'RRRB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_body.mp3`).compile() : ''}

${false ? rule().itemClass('Gloves').socketGroup('==', 'RRRB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_gloves.mp3`).compile() : ''}

${false ? rule().itemClass('Boots').socketGroup('==', 'RRRB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_boots.mp3`).compile() : ''}

${false ? rule().itemClass('Helmets').socketGroup('==', 'RRRB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_helm.mp3`).compile() : ''}

# RRGB
${false ? rule().itemClass('Body Armours').socketGroup('==', 'RRGB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_body.mp3`).compile() : ''}

${false ? rule().itemClass('Gloves').socketGroup('==', 'RRGB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_gloves.mp3`).compile() : ''}

${false ? rule().itemClass('Boots').socketGroup('==', 'RRGB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_boots.mp3`).compile() : ''}

${false ? rule().itemClass('Helmets').socketGroup('==', 'RRGB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_helm.mp3`).compile() : ''}


# BBBB
${rule().itemClass('Body Armours').socketGroup('==', 'BBBB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4b_body.mp3`).compile()}

${rule().itemClass('Gloves').socketGroup('==', 'BBBB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4b_gloves.mp3`).compile()}

${rule().itemClass('Boots').socketGroup('==', 'BBBB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4b_boots.mp3`).compile()}

${rule().itemClass('Helmets').socketGroup('==', 'BBBB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4b_helm.mp3`).compile()}

# BBBR
${rule().itemClass('Body Armours').socketGroup('==', 'BBBR').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3b1red_body.mp3`).compile()}

${rule().itemClass('Gloves').socketGroup('==', 'BBBR').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3b1red_gloves.mp3`).compile()}

${rule().itemClass('Boots').socketGroup('==', 'BBBR').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3b1red_boots.mp3`).compile()}

${rule().itemClass('Helmets').socketGroup('==', 'BBBR').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3b1red_helm.mp3`).compile()}

# BBBG
${rule().itemClass('Body Armours').socketGroup('==', 'BBBG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3b1g_body.mp3`).compile()}

${rule().itemClass('Gloves').socketGroup('==', 'BBBG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3b1g_gloves.mp3`).compile()}

${rule().itemClass('Boots').socketGroup('==', 'BBBG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3b1g_boots.mp3`).compile()}

${rule().itemClass('Helmets').socketGroup('==', 'BBBG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3b1g_helm.mp3`).compile()}

# BBRG
${false ? rule().itemClass('Body Armours').socketGroup('==', 'BBRG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_body.mp3`).compile() : ''}

${false ? rule().itemClass('Gloves').socketGroup('==', 'BBRG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_gloves.mp3`).compile() : ''}

${false ? rule().itemClass('Boots').socketGroup('==', 'BBRG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_boots.mp3`).compile() : ''}

${false ? rule().itemClass('Helmets').socketGroup('==', 'BBRG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_helm.mp3`).compile() : ''} 

# GGGG
${rule().itemClass('Body Armours').socketGroup('==', 'GGGG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4green_body.mp3`).compile()}

${rule().itemClass('Gloves').socketGroup('==', 'GGGG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4green_gloves.mp3`).compile()}

${rule().itemClass('Boots').socketGroup('==', 'GGGG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4green_boots.mp3`).compile()}

${rule().itemClass('Helmets').socketGroup('==', 'GGGG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4green_helm.mp3`).compile()}

# GGGR
${rule().itemClass('Body Armours').socketGroup('==', 'GGGR').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3g1red_body.mp3`).compile()}

${rule().itemClass('Gloves').socketGroup('==', 'GGGR').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3g1red_gloves.mp3`).compile()}

${rule().itemClass('Boots').socketGroup('==', 'GGGR').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3g1red_boots.mp3`).compile()}

${rule().itemClass('Helmets').socketGroup('==', 'GGGR').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3g1red_helm.mp3`).compile()}

# GGGB
${rule().itemClass('Body Armours').socketGroup('==', 'GGGB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3g1b_body.mp3`).compile()}

${rule().itemClass('Gloves').socketGroup('==', 'GGGB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3g1b_gloves.mp3`).compile()}

${rule().itemClass('Boots').socketGroup('==', 'GGGB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3g1b_boots.mp3`).compile()}

${rule().itemClass('Helmets').socketGroup('==', 'GGGB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}3g1b_helm.mp3`).compile()}

# GGRB
${rule().itemClass('Body Armours').socketGroup('==', 'GGRB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}ggrb_body.mp3`).compile()}

${rule().itemClass('Gloves').socketGroup('==', 'GGRB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}ggrb_gloves.mp3`).compile()}

${rule().itemClass('Boots').socketGroup('==', 'GGRB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}ggrb_boots.mp3`).compile()}

${rule().itemClass('Helmets').socketGroup('==', 'GGRB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}ggrb_helm.mp3`).compile()}

# RRBB
${false ? rule().itemClass('Body Armours').socketGroup('==', 'RRBB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_body.mp3`).compile() : ''}

${false ? rule().itemClass('Gloves').socketGroup('==', 'RRBB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_gloves.mp3`).compile() : ''}

${false ? rule().itemClass('Boots').socketGroup('==', 'RRBB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_boots.mp3`).compile() : ''}

${false ? rule().itemClass('Helmets').socketGroup('==', 'RRBB').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_helm.mp3`).compile() : ''}

# RRGG
${rule().itemClass('Body Armours').socketGroup('==', 'RRGG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}2red2g_body.mp3`).compile()}

${rule().itemClass('Gloves').socketGroup('==', 'RRGG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}2red2g_gloves.mp3`).compile()}

${rule().itemClass('Boots').socketGroup('==', 'RRGG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}2red2g_boots.mp3`).compile()}

${rule().itemClass('Helmets').socketGroup('==', 'RRGG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}2red2g_helm.mp3`).compile()}

# BBGG
${false ? rule().itemClass('Body Armours').socketGroup('==', 'BBGG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_body.mp3`).compile() : ''}

${false ? rule().itemClass('Gloves').socketGroup('==', 'BBGG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_gloves.mp3`).compile() : ''}

${false ? rule().itemClass('Boots').socketGroup('==', 'BBGG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_boots.mp3`).compile() : ''}

${false ? rule().itemClass('Helmets').socketGroup('==', 'BBGG').icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_helm.mp3`).compile() : ''}

## Other 4 Links

# Armour
${rule().itemClass('Body Armours').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('>=', 1).baseES('==', 0).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_armour_body.mp3`).compile()}
${rule().itemClass('Gloves').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('>=', 1).baseES('==', 0).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_armour_gloves.mp3`).compile()}
${rule().itemClass('Boots').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('>=', 1).baseES('==', 0).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_armour_boots.mp3`).compile()}
${rule().itemClass('Helmets').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('>=', 1).baseES('==', 0).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_armour_helm.mp3`).compile()}

# Armour Evasion
${rule().itemClass('Body Armours').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('>=', 1).baseES('==', 0).baseEvasion('>=', 1).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_armour_evasion_body.mp3`).compile()}
${rule().itemClass('Gloves').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('>=', 1).baseES('==', 0).baseEvasion('>=', 1).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_armour_evasion_gloves.mp3`).compile()}
${rule().itemClass('Boots').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('>=', 1).baseES('==', 0).baseEvasion('>=', 1).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_armour_evasion_boots.mp3`).compile()}
${rule().itemClass('Helmets').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('>=', 1).baseES('==', 0).baseEvasion('>=', 1).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_armour_evasion_helm.mp3`).compile()}

# Armour Energy Shield
${rule().itemClass('Body Armours').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('>=', 1).baseES('>=', 1).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_armour_e_s_body.mp3`).compile()}
${rule().itemClass('Gloves').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('>=', 1).baseES('>=', 1).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_armour_e_s_gloves.mp3`).compile()}
${rule().itemClass('Boots').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('>=', 1).baseES('>=', 1).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_armour_e_s_boots.mp3`).compile()}
${rule().itemClass('Helmets').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('>=', 1).baseES('>=', 1).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_armour_e_s_helm.mp3`).compile()}

# Evasion
${rule().itemClass('Body Armours').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('==', 0).baseES('==', 0).baseEvasion('>=', 1).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_evasion_body.mp3`).compile()}
${rule().itemClass('Gloves').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('==', 0).baseES('==', 0).baseEvasion('>=', 1).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_evasion_gloves.mp3`).compile()}
${rule().itemClass('Boots').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('==', 0).baseES('==', 0).baseEvasion('>=', 1).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_evasion_boots.mp3`).compile()}
${rule().itemClass('Helmets').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('==', 0).baseES('==', 0).baseEvasion('>=', 1).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_evasion_helm.mp3`).compile()}

# Evasion Energy Shield
${rule().itemClass('Body Armours').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('==', 0).baseES('>=', 1).baseEvasion('>=', 1).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_evasion_e_s_body.mp3`).compile()}
${rule().itemClass('Gloves').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('==', 0).baseES('>=', 1).baseEvasion('>=', 1).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_evasion_e_s_gloves.mp3`).compile()}
${rule().itemClass('Boots').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('==', 0).baseES('>=', 1).baseEvasion('>=', 1).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_evasion_e_s_boots.mp3`).compile()}
${rule().itemClass('Helmets').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('==', 0).baseES('>=', 1).baseEvasion('>=', 1).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_evasion_e_s_helm.mp3`).compile()}

# Energy Shield
${rule().itemClass('Body Armours').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('==', 0).baseES('>=', 1).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_e_s_body.mp3`).compile()}
${rule().itemClass('Gloves').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('==', 0).baseES('>=', 1).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_e_s_gloves.mp3`).compile()}
${rule().itemClass('Boots').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('==', 0).baseES('>=', 1).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_e_s_boots.mp3`).compile()}
${rule().itemClass('Helmets').linkedSockets('==', 4).areaLevel('<=', 53).baseArmour('==', 0).baseES('>=', 1).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).customSound(`${SOUND_FOLDER}4_link_e_s_helm.mp3`).compile()}

## 3 Links

# RRR
${rule().itemClass('Body Armours').socketGroup('==', 'RRR').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}3red_body.mp3`).compile()}
${rule().itemClass('Gloves').socketGroup('==', 'RRR').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}3red_gloves.mp3`).compile()}
${rule().itemClass('Boots').socketGroup('==', 'RRR').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}3red_boots.mp3`).compile()}
${rule().itemClass('Helmets').socketGroup('==', 'RRR').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}3red_helm.mp3`).compile()}

# RRG
${rule().itemClass('Body Armours').socketGroup('==', 'RRG').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2red1g_body.mp3`).compile()}
${rule().itemClass('Gloves').socketGroup('==', 'RRG').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2red1g_gloves.mp3`).compile()}
${rule().itemClass('Boots').socketGroup('==', 'RRG').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2red1g_boots.mp3`).compile()}
${rule().itemClass('Helmets').socketGroup('==', 'RRG').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2red1g_helm.mp3`).compile()}

# RRB
${rule().itemClass('Body Armours').socketGroup('==', 'RRB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2red1b_body.mp3`).compile()}
${rule().itemClass('Gloves').socketGroup('==', 'RRB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2red1b_gloves.mp3`).compile()}
${rule().itemClass('Boots').socketGroup('==', 'RRB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2red1b_boots.mp3`).compile()}
${rule().itemClass('Helmets').socketGroup('==', 'RRB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2red1b_helm.mp3`).compile()}

# GGG
${rule().itemClass('Body Armours').socketGroup('==', 'GGG').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}3green_body.mp3`).compile()}
${rule().itemClass('Gloves').socketGroup('==', 'GGG').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}3green_gloves.mp3`).compile()}
${rule().itemClass('Boots').socketGroup('==', 'GGG').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}3green_boots.mp3`).compile()}
${rule().itemClass('Helmets').socketGroup('==', 'GGG').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}3green_helm.mp3`).compile()}

# GGB
${rule().itemClass('Body Armours').socketGroup('==', 'GGB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2g1blue_body.mp3`).compile()}
${rule().itemClass('Gloves').socketGroup('==', 'GGB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2g1blue_gloves.mp3`).compile()}
${rule().itemClass('Boots').socketGroup('==', 'GGB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2g1blue_boots.mp3`).compile()}
${rule().itemClass('Helmets').socketGroup('==', 'GGB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2g1blue_helm.mp3`).compile()}

# BBB
${rule().itemClass('Body Armours').socketGroup('==', 'BBB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}3b_body.mp3`).compile()}
${rule().itemClass('Gloves').socketGroup('==', 'BBB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}3b_gloves.mp3`).compile()}
${rule().itemClass('Boots').socketGroup('==', 'BBB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}3b_boots.mp3`).compile()}
${rule().itemClass('Helmets').socketGroup('==', 'BBB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}3b_helm.mp3`).compile()}

# BBR
${rule().itemClass('Body Armours').socketGroup('==', 'BBR').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2b1red_body.mp3`).compile()}
${rule().itemClass('Gloves').socketGroup('==', 'BBR').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2b1red_gloves.mp3`).compile()}
${rule().itemClass('Boots').socketGroup('==', 'BBR').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2b1red_boots.mp3`).compile()}
${rule().itemClass('Helmets').socketGroup('==', 'BBR').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2b1red_helm.mp3`).compile()}

# BBG
${rule().itemClass('Body Armours').socketGroup('==', 'BBG').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2b1g_body.mp3`).compile()}
${rule().itemClass('Gloves').socketGroup('==', 'BBG').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2b1g_gloves.mp3`).compile()}
${rule().itemClass('Boots').socketGroup('==', 'BBG').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2b1g_boots.mp3`).compile()}
${rule().itemClass('Helmets').socketGroup('==', 'BBG').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}2b1g_helm.mp3`).compile()}

# RGB
${rule().itemClass('Body Armours').socketGroup('==', 'RGB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}chrome_body.mp3`).compile()}
${rule().itemClass('Gloves').socketGroup('==', 'RGB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}chrome_gloves.mp3`).compile()}
${rule().itemClass('Boots').socketGroup('==', 'RGB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}chrome_boots.mp3`).compile()}
${rule().itemClass('Helmets').socketGroup('==', 'RGB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}chrome_helm.mp3`).compile()}
${rule().itemClass('Helmets').socketGroup('==', 'RGB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}chrome_helm.mp3`).compile()}
${rule().itemClass('Shields').socketGroup('==', 'RGB').icon('Green', 'Diamond').areaLevel('<=', 33).style(STYLE.E).customSound(`${SOUND_FOLDER}chrome_shield.mp3`).compile()}

### Flasks

# Life Flasks
${rule().itemClass('Life Flasks').baseType('Small').rarity('<=', 'Magic').areaLevel('<=', 12).baseType('Life Flask').icon('Red', 'Raindrop').style(STYLE.F).customSound(`${SOUND_FOLDER}life.mp3`).compile()}

${rule().itemClass('Life Flasks').baseType('Medium').rarity('<=', 'Magic').areaLevel('<=', 16).baseType('Life Flask').icon('Red', 'Raindrop').style(STYLE.F).customSound(`${SOUND_FOLDER}medium_life.mp3`).compile()}

${rule().itemClass('Life Flasks').baseType('Large').rarity('<=', 'Magic').areaLevel('<=', 24).baseType('Life Flask').icon('Red', 'Raindrop').style(STYLE.F).customSound(`${SOUND_FOLDER}large_life.mp3`).compile()}

${rule().itemClass('Life Flasks').baseType('Greater').rarity('<=', 'Magic').areaLevel('<=', 28).baseType('Life Flask').icon('Red', 'Raindrop').style(STYLE.F).customSound(`${SOUND_FOLDER}greater_life.mp3`).compile()}

${rule().itemClass('Life Flasks').baseType('Grand').rarity('<=', 'Magic').areaLevel('<=', 32).baseType('Life Flask').icon('Red', 'Raindrop').style(STYLE.F).customSound(`${SOUND_FOLDER}grand_life.mp3`).compile()}

${rule().itemClass('Life Flasks').baseType('Giant').rarity('<=', 'Magic').areaLevel('<=', 35).baseType('Life Flask').icon('Red', 'Raindrop').style(STYLE.F).customSound(`${SOUND_FOLDER}giant_life.mp3`).compile()}

${rule().itemClass('Life Flasks').baseType('Colossal').rarity('<=', 'Magic').areaLevel('<=', 40).baseType('Life Flask').icon('Red', 'Raindrop').style(STYLE.F).customSound(`${SOUND_FOLDER}colossal_life.mp3`).compile()}

${rule().itemClass('Life Flasks').baseType('Hallowed').rarity('<=', 'Magic').areaLevel('<=', 60).baseType('Life Flask').icon('Red', 'Raindrop').style(STYLE.F).customSound(`${SOUND_FOLDER}life.mp3`).compile()}

${rule().itemClass('Life Flasks').baseType('Divine').rarity('<=', 'Magic').baseType('Life Flask').icon('Red', 'Raindrop').style(STYLE.F).customSound(`${SOUND_FOLDER}life.mp3`).compile()}

# Mana Flasks
${rule().itemClass('Mana Flasks').baseType('Small').rarity('<=', 'Magic').areaLevel('<=', 12).baseType('Mana Flask').icon('Blue', 'Raindrop').style(STYLE.G).customSound(`${SOUND_FOLDER}mana.mp3`).compile()}

${rule().itemClass('Mana Flasks').baseType('Medium').rarity('<=', 'Magic').areaLevel('<=', 16).baseType('Mana Flask').icon('Blue', 'Raindrop').style(STYLE.G).customSound(`${SOUND_FOLDER}medium_mana.mp3`).compile()}

${rule().itemClass('Mana Flasks').baseType('Large').rarity('<=', 'Magic').areaLevel('<=', 24).baseType('Mana Flask').icon('Blue', 'Raindrop').style(STYLE.G).customSound(`${SOUND_FOLDER}large_mana.mp3`).compile()}

${rule().itemClass('Mana Flasks').baseType('Greater').rarity('<=', 'Magic').areaLevel('<=', 28).baseType('Mana Flask').icon('Blue', 'Raindrop').style(STYLE.G).customSound(`${SOUND_FOLDER}greater_mana.mp3`).compile()}

${rule().itemClass('Mana Flasks').baseType('Grand').rarity('<=', 'Magic').areaLevel('<=', 32).baseType('Mana Flask').icon('Blue', 'Raindrop').style(STYLE.G).customSound(`${SOUND_FOLDER}grand_mana.mp3`).compile()}

${rule().itemClass('Mana Flasks').baseType('Giant').rarity('<=', 'Magic').areaLevel('<=', 42).baseType('Mana Flask').icon('Blue', 'Raindrop').style(STYLE.G).customSound(`${SOUND_FOLDER}giant_mana.mp3`).compile()}

${rule().itemClass('Mana Flasks').baseType('Colossal').rarity('<=', 'Magic').areaLevel('<=', 45).baseType('Mana Flask').icon('Blue', 'Raindrop').style(STYLE.G).customSound(`${SOUND_FOLDER}mana.mp3`).compile()}

${rule().itemClass('Mana Flasks').baseType('Sanctified').rarity('<=', 'Magic').areaLevel('<=', 60).baseType('Mana Flask').icon('Blue', 'Raindrop').style(STYLE.G).customSound(`${SOUND_FOLDER}mana.mp3`).compile()}

${rule().itemClass('Mana Flasks').baseType('Eternal', 'Divine').rarity('<=', 'Magic').baseType('Mana Flask').icon('Blue', 'Raindrop').style(STYLE.G).customSound(`${SOUND_FOLDER}mana.mp3`).compile()}

## Utility Flasks

${rule().itemClass('Utility Flasks').baseType('Jade').icon('Green', 'Raindrop').style(STYLE.H).customSound(`${SOUND_FOLDER}jade.mp3`).compile()}

${rule().itemClass('Utility Flasks').baseType('Quartz').icon('Green', 'Raindrop').style(STYLE.H).customSound(`${SOUND_FOLDER}quartz.mp3`).compile()}

${rule().itemClass('Utility Flasks').baseType('Quicksilver').icon('Green', 'Raindrop').style(STYLE.H).customSound(`${SOUND_FOLDER}quicksilver.mp3`).compile()}

${rule().itemClass('Utility Flasks').baseType('Silver').icon('Green', 'Raindrop').style(STYLE.H).customSound(`${SOUND_FOLDER}silver.mp3`).compile()}

${rule().itemClass('Utility Flasks').icon('Grey', 'Raindrop').style(STYLE.H).background(0, 0, 0).sound(12).compile()}


### Items (ADJUST)

# Jeweller Recipe
${rule().sockets('==', 6).icon('Grey', 'Diamond').text(255, 255, 255).background(0, 168, 0).border(255, 255, 255).size(45).customSound(`${SOUND_FOLDER}6_socket.mp3`).compile()}

# Tincture
${rule().baseType('Prismatic Tincture').icon('Red', 'Raindrop').background(70, 0, 30).border(235, 25, 55).sound(6).compile()}

## 4 Socket Bases
# Armour
${rule().itemClass('Helmets', 'Body Armours', 'Gloves', 'Boots').sockets('>=', 4).areaLevel('<=', 45).baseArmour('>=', 1).baseES('==', 0).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).compile()}

# Evasion
${rule().itemClass('Helmets', 'Body Armours', 'Gloves', 'Boots').sockets('>=', 4).areaLevel('<=', 45).baseArmour('==', 0).baseES('==', 0).baseEvasion('>=', 1).icon('Cyan', 'Diamond').style(STYLE.D).compile()}

# Energy Shield
${rule().itemClass('Helmets', 'Body Armours', 'Gloves', 'Boots').sockets('>=', 4).areaLevel('<=', 45).baseArmour('==', 0).baseES('>=', 1).baseEvasion('==', 0).icon('Cyan', 'Diamond').style(STYLE.D).compile()}

# Good Shields
${rule().baseType('Painted Buckler', 'War Buckler').background(0, 50, 0).size(45).compile()}

# Good 3 Sockets
${rule().sockets('==', 3).itemClass('Helmets', 'Body Armours', 'Gloves', 'Boots').socketGroup('>=', 'RG', 'GR', 'GG', 'RR', 'BB').areaLevel('<=', 33).border(255, 0, 127).compile()}

# Good 2 Sockets
${rule().sockets('==', 2).itemClass('Helmets', 'Body Armours', 'Gloves', 'Boots').socketGroup('>=', 'RG', 'GR', 'GG', 'RR', 'BB').areaLevel('<=', 24).border(255, 127, 0).compile()}

### Act 1

# Weapons
${rule().baseType('Stone Axe', 'Jade Chopper', 'Corroded Blade', 'Longsword', 'Tribal Maul').rarity('==', 'Rare').areaLevel('<=', 13).icon('Yellow', 'UpsideDownHouse').border(0, 255, 255).background(0, 25, 40).sound(3).compile()}

${rule().baseType('Stone Axe', 'Jade Chopper', 'Corroded Blade', 'Longsword', 'Tribal Maul').rarity('<', 'Rare').areaLevel('<=', 13).icon('Cyan', 'UpsideDownHouse').border(0, 255, 255).compile()}

# Shields
${rule().itemClass('Shields').socketGroup('>=', 'RG', 'GR').baseES('==', 0).areaLevel('<=', 13).background(40, 20, 0).border(255, 68, 0).size(40).compile()}

${rule().itemClass('Shields').baseES('==', 0).areaLevel('<=', 13).border(255, 68, 0).size(40).compile()}

# One Hand Axes
${rule().baseType('Rusted Hatchet', 'Boarding Axe').icon('Cyan', 'UpsideDownHouse').border(0, 255, 255).size(45).compile()}

# Momentum Colors
${rule().socketGroup('>=', 'RRG', 'RGR', 'GRR').areaLevel('<=', 16).icon('Orange', 'Kite').border(255, 0, 0).background(50, 0, 0).size(45).compile()}

## Jewellery

#Rings
${rule().baseType('Sapphire', 'Ruby', 'Topaz', 'Two-Stone').itemClass('Rings').rarity('==', 'Rare').icon('Pink', 'Moon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}rare_ring.mp3`).compile()}

${rule().baseType('Amethyst').itemClass('Rings').rarity('==', 'Rare').icon('Brown', 'Moon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}rare_amethyst.mp3`).compile()}

${rule().baseType('Amethyst').itemClass('Rings').rarity('<=', 'Rare').icon('Cyan', 'Moon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}amethyst.mp3`).compile()}

${rule().baseType('Iron').itemClass('Rings').areaLevel('<=', 16).rarity('<=', 'Rare').icon('Purple', 'Moon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}iron.mp3`).compile()}

${rule().baseType('Iron').itemClass('Rings').rarity('==', 'Rare').icon('Purple', 'Moon').border(192, 0, 255).background(50, 0, 70).size(45).compile()}

${rule().baseType('Coral').itemClass('Rings').areaLevel('<=', 16).rarity('<=', 'Magic').icon('Purple', 'Moon').border(192, 0, 255).background(50, 0, 70).size(45).compile()}

${rule().baseType('Coral').itemClass('Rings').rarity('==', 'Rare').icon('Purple', 'Moon').border(192, 0, 255).background(50, 0, 70).size(45).compile()}

${rule().baseType('Sapphire').itemClass('Rings').areaLevel('<=', 45).rarity('<=', 'Rare').icon('Cyan', 'Moon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}sapphire.mp3`).compile()}

${rule().baseType('Ruby').itemClass('Rings').areaLevel('<=', 45).rarity('<=', 'Rare').icon('Red', 'Moon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}sapphire.mp3`).compile()}

${rule().baseType('Topaz').itemClass('Rings').areaLevel('<=', 45).rarity('<=', 'Rare').icon('Yellow', 'Moon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}sapphire.mp3`).compile()}

${rule().baseType('Two-Stone').itemClass('Rings').areaLevel('<=', 45).rarity('<=', 'Rare').icon('Green', 'Moon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}two_stone.mp3`).compile()}

# Belts
${rule().baseType('Leather').itemClass('Belts').rarity('==', 'Rare').icon('Yellow', 'Pentagon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}rare_leather.mp3`).compile()}

${rule().baseType('Leather').itemClass('Belts').areaLevel('<=', 45).rarity('==', 'Magic').icon('Yellow', 'Pentagon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}magic_leather.mp3`).compile()}

${rule().baseType('Leather').itemClass('Belts').areaLevel('<=', 28).rarity('==', 'Normal').icon('Yellow', 'Pentagon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}leather_belt.mp3`).compile()}

${rule().baseType('Heavy').itemClass('Belts').rarity('==', 'Rare').icon('Orange', 'Pentagon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}rare_heavy.mp3`).compile()}

${rule().baseType('Heavy').itemClass('Belts').areaLevel('<=', 45).rarity('==', 'Magic').icon('Orange', 'Pentagon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}magic_heavy.mp3`).compile()}

${rule().baseType('Heavy').itemClass('Belts').areaLevel('<=', 28).rarity('==', 'Normal').icon('Orange', 'Pentagon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}heavy_belt.mp3`).compile()}

${rule().baseType('Rustic').itemClass('Belts').areaLevel('<=', 12).icon('White', 'Pentagon').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}rustic.mp3`).compile()}

${rule().baseType('Chain').itemClass('Belts').areaLevel('<=', 12).border(192, 0, 255).background(50, 0, 70).size(45).compile()}

# Amulets
${rule().baseType('Amber').itemClass('Amulets').areaLevel('<=', 24).icon('Red', 'Cross').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}amber.mp3`).compile()}

${rule().baseType('Lapis').itemClass('Amulets').areaLevel('<=', 24).icon('Red', 'Cross').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}lapis.mp3`).compile()}

${rule().baseType('Jade').itemClass('Amulets').areaLevel('<=', 24).icon('Red', 'Cross').border(192, 0, 255).background(50, 0, 70).size(45).customSound(`${SOUND_FOLDER}jade.mp3`).compile()}

${rule().baseType('Amber', 'Jade', 'Lapis', 'Turquoise', 'Onyx', 'Agate', 'Citrine').itemClass('Amulets').rarity('==', 'Rare').border(192, 0, 255).background(50, 0, 70).size(45).compile()}

# Rare Items
${rule().itemClass('Boots').areaLevel('<=', 24).rarity('==', 'Rare').border(255, 255, 100).background(50, 40, 0).size(45).customSound(`${SOUND_FOLDER}rare_boots.mp3`).compile()}

${rule().itemClass('Boots').rarity('==', 'Rare').border(255, 255, 100).background(50, 40, 0).size(45).compile()}

${rule().itemClass('Helmets', 'Body Armours', 'Gloves', 'Boots', 'Rings', 'Amulets', 'Belts', 'Shields').rarity('==', 'Rare').areaLevel('<=', 45).size(45).compile()}

${rule().width('==', 2).height('>=', 4).areaLevel('<=', 12).rarity('==', 'Rare').size(40).compile()}

${rule().width('==', 2).height('>=', 4).areaLevel('<=', 45).rarity('==', 'Rare').size(35).compile()}

${rule().width('==', 2).height('==', 3).areaLevel('<=', 12).rarity('==', 'Rare').size(45).compile()}

${rule().width('==', 2).height('==', 3).areaLevel('<=', 45).rarity('==', 'Rare').size(40).compile()}

${rule().areaLevel('<=', 45).rarity('==', 'Rare').size(45).compile()}

# Chromatic

${rule().width('==', 1).height('==', 3).socketGroup('==', 'RGB', 'GRB', 'BGR').border(0, 168, 0).background(0, 50, 0).size(40).customSound(`${SOUND_FOLDER}pop.mp3`).compile()}

${rule().width('==', 2).height('==', 2).socketGroup('==', 'RGB', 'GRB', 'BGR').border(0, 168, 0).background(0, 50, 0).size(40).customSound(`${SOUND_FOLDER}pop.mp3`).compile()}

${rule().width('==', 2).height('==', 4).socketGroup('==', 'RGB', 'GRB', 'BGR').areaLevel('<=', 20).border(0, 168, 0).background(0, 50, 0).size(40).customSound(`${SOUND_FOLDER}pop.mp3`).compile()}

# Early 3 Sockets
${rule().sockets('==', 3).itemClass('Helmets', 'Body Armours', 'Gloves', 'Boots', 'Shields').areaLevel('<=', 16).size(45).compile()}

# Worst Case Sockets
${rule().socketGroup('>=', 'G', 'B', 'R').itemClass('Helmets', 'Body Armours', 'Gloves', 'Boots', 'Shields').areaLevel('<=', 10).size(40).compile()}

# Magic Items
${rule().rarity('==', 'Magic').areaLevel('<=', 10).size(40).compile()}

# Normal Items
${rule().rarity('==', 'Normal').areaLevel('<=', 4).size(40).compile()}

### Quest Items
${rule().itemClass('Quest Items').text(0, 255, 0).border(0, 255, 0).background(0, 0, 0).size(45).effect('Green').sound(3).compile()}

### Div Cards
${rule().baseType("The Heroic Shot", "Society's Remorse").icon("Green", "Circle").text(0, 255, 0).border(0, 255, 0).background(0, 0, 0).size(45).sound(2).compile()}

${rule().itemClass('Divination Cards').text(0, 255, 0).size(40).compile()}

${rule()
  .baseType(
    "A Mother's Parting Gift",
    "Alivia's Grace",
    'Audacity',
    'Call to the First Ones',
    "Cartographer's Delight",
    'Cursed Words',
    'Destined to Crumble',
    'Echoes of Love',
    'Forbidden Power',
    'Grave Knowledge',
    "Lantador's Lost Love",
    'Light and Truth',
    'Might is Right',
    'Prosperity',
    'Rain Tempter',
    'Rats',
    'Rebirth',
    'Reckless Ambition',
    'Struck by Lightning',
    'The Adventuring Spirit',
    'The Army of Blood',
    'The Avenger',
    'The Beast',
    'The Betrayal',
    'The Blazing Fire',
    'The Brawny Battle Mage',
    'The Carrion Crow',
    'The Cataclysm',
    'The Catch',
    'The Coming Storm',
    'The Conduit',
    'The Cursed King',
    'The Deceiver',
    'The Deep Ones',
    'The Demoness',
    'The Dreamland',
    'The Drunken Aristocrat',
    'The Fathomless Depths',
    'The Feast',
    'The Fletcher',
    'The Forsaken',
    'The Fox in the Brambles',
    'The Golden Era',
    'The Harvester',
    'The Hermit',
    'The Incantation',
    'The Inoculated',
    'The Insatiable',
    'The Jester',
    'The Journalist',
    "The King's Blade",
    'The Lich',
    'The Lord in Black',
    'The Lord of Celebration',
    'The Lover',
    'The Lunaris Priestess',
    'The Master',
    "The Metalsmith's Gift",
    'The Oath',
    'The Opulent',
    'The Pack Leader',
    'The Poet',
    'The Rabid Rhoa',
    'The Return of the Rat',
    'The Ruthless Ceinture',
    'The Scarred Meadow',
    'The Scavenger',
    'The Sigil',
    'The Siren',
    'The Spoiled Prince',
    'The Sun',
    'The Surgeon',
    "The Sword King's Salute",
    'The Throne',
    'The Twins',
    'The Visionary',
    'The Warden',
    'The Watcher',
    'The Web',
    'The Witch',
    "The Wolf's Shadow",
    'Thirst for Knowledge',
    'Thunderous Skies',
    'Turn the Other Cheek',
    'Vile Power',
    'Her Mask',
    'Man With Bear',
    'The Card Sharp',
    'The Journey',
    'Rain of Chaos',
    "The Flora's Gift",
    'The Gambler',
    'The Deal',
    'Buried Treasure',
    'The Skeleton',
    "Anarchy's Price",
    'The Traitor',
    "Hunter's Resolve",
    "Atziri's Arsenal",
    'Mitts',
    'The Gladiator',
    'The Puzzle',
    'The Summoner',
    'The Explorer',
    "Lysah's Respite",
    'The Tower',
    'Lingering Remnants',
    'Treasure Hunter',
    'The Realm',
    'The Battle Born',
    'The Gentleman',
    "The Wolf's Legacy",
    "Doedre's Madness",
    'The Mercenary',
  )
  .itemClass('Divination Cards')
  .text(0, 255, 0)
  .hide()
  .compile()}

### Misc

## Map Stuff
${rule().itemClass("Vault Keys").style(STYLE.A).icon("Purple", "Star").sound(6).size(45).compile()}

${rule().itemClass("Maps", "Expedition Logbooks").text(255, 255, 255).background(40, 40, 40).border(255, 255, 255).icon("White", "Square").sound(5).size(45).compile()}

${rule().itemClass("Map Fragments", "Misc Map Items").text(255, 0, 50).background(0, 0, 0).border(255, 0, 50).icon("Purple", "Circle").sound(4).size(45).compile()}

${rule().itemClass("Sanctum Research", "Relics").text(255, 0, 50).background(40, 0, 20).border(255, 0, 50).icon("Red", "UpsideDownHouse").sound(5).size(45).compile()}


### Global Hide
${rule().hide().compile()}

`
