// import setupScene from './setupScene'
// const {sphere} = setupScene()

// function setupTheaterForSphere(mesh) {
//   const obj = timeline.getObject('The Ball', mesh, {
//     props: {
//       opacity: {
//         type: Theater.types.number({limit: {from: 0, to: 1}}),
//         default: 1,
//       },
//     },
//   })
// }

// TL.ui.propertyEditors.add({
//   traitName: 'Position2D',
//   render(data) {
//     return <div />
//   }
// })

TL.ui.enable()

new TL.Project('Intro Post')
new TL.Project('Mathly Preview')

const project = new TL.Project('Explorable Explanations')
const timeline = project.getTimeline('scene /  Bouncing  Ball')
project.getTimeline('scene /  Bouncing  Ball 2')
const ball = timeline.createObject('main / The ball')
