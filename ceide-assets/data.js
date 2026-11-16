'use strict';

const references = {
  Blender: 'https://docs.blender.org/manual/en/latest/',
  'Unreal Engine': 'https://dev.epicgames.com/community/unreal-engine/learning',
  Maya: 'https://www.autodesk.com/learn/ondemand/curated/maya-quick-start-guide',
};

const courses = [
  { id:'blender-prop', tool:'Blender', title:'Model a sci-fi prop', level:'Beginner', time:35, art:'prop', description:'Turn simple shapes into a polished game prop with bevels, materials and lighting.',
    lessons:[
      ['Block out the silhouette','Start with a shape that reads at thumbnail size. Separate the body, handles and fasteners so they can be adjusted independently.',
       ['In Object Mode, scale a cube into the main shell. Name it Shell in the Outliner.','Add smaller cubes for corner pads and handles. Look from front, side and three-quarter views as you place them.','Save a blockout version before working on surface detail.'],
       'Make the prop readable as a shadow. Shrink your viewport and check whether the handles and body still read.'],
      ['Bevel and detail','Small bevels catch highlights and show the edges of a prop. Keep the largest forms cleaner than the small detail areas.',
       ['Select the shell, then use Object → Apply → Scale.','Add a Bevel modifier. Start with a small amount and two or three segments.','Duplicate the fasteners and vary the size of the side panels. Check that highlights stay even.'],
       'Compare a screenshot before and after beveling. Look at the corners and decide where the bevel is too large.'],
      ['Light the finished prop','Use one dominant light to explain the shape and a softer fill to make the darker material readable.',
       ['Assign a base paint, a darker trim and a metallic material to small details.','Add a broad Area Light above and in front. Place a softer fill on the opposite side.','Frame with a camera at a three-quarter angle and render. Save a separate wireframe or viewport screenshot for your portfolio.'],
       'Render the same angle against two background colors. Keep the one that separates the silhouette better.'],
    ], quiz:['Why apply object scale before tuning a bevel?',['To make the file smaller','To get a more even bevel width','To turn mesh geometry into lights'],1,'Unapplied nonuniform scale can stretch the bevel along different axes.'] },
  { id:'unreal-world', tool:'Unreal Engine', title:'Build your first level', level:'Beginner', time:40, art:'level', description:'Block out a playable scene, guide the player with light and test it in real time.',
    lessons:[
      ['Lay out the space','A blockout is a working sketch. Test the scale and movement of the level before investing in finished details.',
       ['Create a Third Person template project and save a copy of the map for this exercise.','Place simple floor, wall and platform shapes. Give the scene an entrance, a turn and a destination.','Start Play In Editor and check that the player fits comfortably through every opening.'],
       'Time how long it takes to reach the destination. Remove or shorten one section that slows the route without adding a choice.'],
      ['Guide the eye','Light and contrast help players find where to go. Make the main route easier to read than optional side areas.',
       ['Place a clear landmark at the destination and check its silhouette from the start.','Use a light near the first turn to reveal the next space. Keep competing lights subdued.','Walk the route with the camera at player height and look for moments when you lose the landmark.'],
       'Show the route to someone without giving directions. Note where they hesitate and adjust one light or shape there.'],
      ['Test and capture','Good level presentation shows the route and a moment that explains how it feels to be there.',
       ['Play the level twice. Check for stuck points, unexpected falls and awkward camera collisions.','Capture a wide view that shows the layout and a closer view at player height.','Write a short note: what should the player notice first, and what did you change after testing?'],
       'Add both captures to a portfolio entry. Caption one as the design view and the other as the player view.'],
    ], quiz:['When should you first test movement and scale?',['Only after texturing','While the layout is still a blockout','After publishing the game'],1,'Blockouts make changes cheap, so test the route early.'] },
  { id:'maya-motion', tool:'Maya', title:'Bring motion to life', level:'Beginner', time:30, art:'motion', description:'Keyframe a bouncing ball and shape its timing in the Graph Editor.',
    lessons:[
      ['Set the key poses','A bounce is a good way to study timing because the shape is simple. Start with the highest point, first contact and rebound.',
       ['Create a polygon sphere and a flat ground guide. Move the sphere so it rests with its bottom on the ground.','At frame 1, raise the sphere and set a key on Translate Y. At frame 12, key ground contact.','At frame 22, set a lower rebound peak. Add a final contact at frame 31.'],
       'Play your keys back once. Focus on whether you can read each major pose.'],
      ['Shape the spacing','The ball falls faster near the ground and slows near the apex. Use the curve shape to tell that story.',
       ['Open the Graph Editor and isolate Translate Y.','Keep the tangents flatter at the top of the arc. Make the contact feel sharper by editing the incoming and outgoing tangents.','Scrub frame by frame around impact and make sure the ball does not dip below the floor.'],
       'Make one heavy bounce and one light bounce by changing the height and time between the same main poses.'],
      ['Add weight and review','Squash and stretch can show impact when used briefly. Keep the apparent volume consistent.',
       ['Key a slightly wider, shorter scale at contact. Keep the bottom of the ball aligned to the floor.','Add a small stretch just before or after impact, then return to the normal shape at the peak.','Playblast both bounces and compare the spacing. Keep the clearest version and note why it works.'],
       'Present the playblast with a still of the Graph Editor and a one-sentence note on timing.'],
    ], quiz:['Where should vertical motion slow down during an arc?',['Near the apex','Just before contact','At every frame equally'],0,'At the apex the ball changes direction, so its vertical speed briefly reaches zero.'] },
  { id:'blender-light', tool:'Blender', title:'Light a studio render', level:'Intermediate', time:45, art:'lighting', description:'Build a simple tabletop scene and learn to control contrast, color and reflections.',
    lessons:[
      ['Set the product shot','Keep the set simple so you can judge what each light changes.',
       ['Place a sphere and a torus on a plane. Give one a matte material and the other a glossy material.','Set a camera at a three-quarter angle. Leave space around the subjects.','Reduce ambient lighting and save a baseline render.'],
       'Make the two silhouettes distinct before adding more lights.'],
      ['Build the light rig','A larger Area Light creates softer transitions. Moving a light can change the reflection just as much as changing its intensity.',
       ['Place a large front-side Area Light as your key.','Add a weaker fill and watch how shadow detail changes.','Add a rim light behind the subjects to separate them from the backdrop.'],
       'Render the key alone, then key plus fill, then all three. Compare the highlight edges.'],
      ['Make a lighting breakdown','A useful breakdown shows what each light contributes to the final image.',
       ['Render with the full rig and check that the strongest highlight supports your focal point.','Capture a viewport view showing light positions.','Pair the final image with the baseline and write down one decision about contrast or color.'],
       'Try a cool rim light with a neutral key and decide whether it clarifies the materials.'],
    ], quiz:['Which change generally softens the shadows of an Area Light?',['Lower the render resolution','Use a larger light source','Add more subsurface color'],1,'A larger source generally spreads the shadow transition over a wider area.'] },
  { id:'unreal-interaction', tool:'Unreal Engine', title:'Prototype an interaction', level:'Intermediate', time:50, art:'interaction', description:'Use a reusable Blueprint actor to reveal a simple game objective.',
    lessons:[
      ['Build the actor','Keep the visual parts and trigger together so the same interaction can be placed around a level.',
       ['Create an Actor Blueprint and add a visible static mesh and a Box Collision component.','Place two instances in a test level, then adjust the collision box to be a little larger than the visible object.','Configure the box to generate overlap events and respond to Pawns.'],
       'Run into the object from two angles. Check that the trigger is in the place you expect.'],
      ['Give clear feedback','Test the overlap with a simple signal before building visual effects.',
       ['Add the box Begin Overlap event in the Event Graph and connect it to Print String.','Confirm that the player Pawn starts the feedback when entering the box.','Replace or supplement the debug message with a visible change, such as enabling a light component.'],
       'Ask someone to trigger the object without instructions. Can they tell which action caused the change?'],
      ['Test edge cases','Decide whether the interaction should repeat or happen only once. Make that rule clear in the graph.',
       ['Add a Boolean state or a Do Once node if the actor should only activate once.','Test leaving and reentering the trigger, then test two placed instances independently.','Name the components and capture the Blueprint graph and a short demo of the interaction.'],
       'Explain which node starts the interaction and what prevents it from firing again.'],
    ], quiz:['What normally starts a proximity-based interaction in this example?',['A collision overlap event','A texture import','The camera field of view'],0,'The overlap event is triggered by a Pawn entering the configured box.'] },
  { id:'maya-topology', tool:'Maya', title:'Shape clean topology', level:'Intermediate', time:45, art:'topology', description:'Build geometry that holds a silhouette and bends predictably.',
    lessons:[
      ['Plan the edge flow','Topology directs how a shape subdivides and deforms. Start simple and spend polygons where they change the form.',
       ['Use a cylinder as a test arm and name it in the Outliner.','Insert edge loops on either side of the elbow position and keep the middle evenly spaced.','Compare a flat-shaded view with a smooth preview, watching the silhouette.'],
       'Take a screenshot with edge loops visible and mark where you want the bend to happen.'],
      ['Control your edges','Supporting edges help preserve sharper details. Place them with care so they do not force awkward pinching.',
       ['Add a close support loop near one end of the test mesh.','Preview smoothing and compare the two ends.','Adjust spacing at any spot that looks pinched. Check the silhouette from another angle.'],
       'Make one rounded variant and one sharper variant with the same basic shape.'],
      ['Check the deformation','The real test of topology is how the shape responds to movement.',
       ['Apply a non-linear Bend deformer and place its handle around the elbow area.','Compare a mild bend with a deeper bend and look for collapsed edges.','Adjust the loop distribution and capture both the wireframe and the smooth view.'],
       'Create a side-by-side image of the first and improved bend for your portfolio.'],
    ],quiz:['Where should you concentrate geometry for this exercise?',['Only in the flat center of rigid sections','Where the form changes or deforms','Randomly, to avoid all patterns'],1,'Changes in silhouette and deformation benefit from purposeful spacing and additional geometry.'] },
];

const projectTypes=['Game design','3D art','Animation','VFX'];
const exampleProjects=[
  {id:'serendib',title:'Serendib Still Breathes',maker:'Lakmal MAS · Studio 141',category:'Game design',image:'serendib.webp',alt:'A deserted street in post-apocalyptic Colombo',summary:'A third-person survival adventure set in a fictional post-apocalyptic Sri Lanka.',detail:'The game showcase uses cinematic and gameplay captures to introduce the bunker, Jungle Gorge and Colombo. The location gallery tells a larger story through a few deliberate scenes.',url:'https://lakmalmas.github.io/serendib-showcase/',urlLabel:'Visit the game showcase',kind:'Featured project'},
  {id:'explorer',title:'CEIDE Explorer',maker:'CEIDE · Visual design',category:'3D art',image:'explorer.webp',alt:'A violet retro robot with glowing green eyes',summary:'A retro CRT mascot designed to introduce CEIDE’s 3D learning world.',detail:'A violet shell, lime eyes and viewport markings tie the character to the new interface. The image is AI-generated concept artwork, composited and cropped for the website.',kind:'Concept artwork'},
];

const studios=[
  {id:'nd', name:'Naughty Dog', initials:'ND', category:'Games', location:'Santa Monica, United States', focus:'Narrative games · character and environment art', url:'https://www.naughtydog.com/careers', tone:'violet'},
  {id:'riot', name:'Riot Games', initials:'RG', category:'Games', location:'Multiple locations', focus:'Game art, animation and design', url:'https://www.riotgames.com/en/work-with-us', tone:'peach'},
  {id:'pixar', name:'Pixar Animation Studios', initials:'PX', category:'Animation', location:'Emeryville, United States', focus:'Feature animation · art and production', url:'https://www.pixar.com/careers', tone:'green'},
  {id:'ilm', name:'Industrial Light & Magic', initials:'ILM', category:'VFX', location:'Multiple locations', focus:'Visual effects · virtual production', url:'https://www.ilm.com/careers/', tone:'violet'},
  {id:'frame', name:'Framestore', initials:'FS', category:'VFX', location:'Multiple locations', focus:'Visual effects · animation · immersive work', url:'https://www.framestore.com/careers', tone:'green'},
  {id:'dneg', name:'DNEG', initials:'DN', category:'VFX', location:'Multiple locations', focus:'Visual effects · feature animation', url:'https://www.dneg.com/join-us', tone:'peach'},
];
