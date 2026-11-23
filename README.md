word count: 183

Project Status: Implemented a UI, allowing users to place virtual objects into a simulated 2d canvas of a 3d room, within different zones. Can choose what object to place, a glare avoidance weight value, and then choose to auto place object, where AI engine uses values from user to place in best zone position. User has option to manually override placement, placing object into position next to placement. User can also Click on zone they'd like to place object on. In bottom right is an AI Placement rationale card, giving users explanation of placement with values, e.g. glare risk, optimal viewing distance, system confidence.

Technology Stack - HTML, CSS, AND JS, as well as gemini to help with development

to Run: simply click on the html file

Development record - unfortunately I forgot to record every single development change on github, but here they are. Stage 1: Simple UI Layout, Stage 2: Placement algorithm logic simulation, Stage 3: User override controls

-AI Assistant - use of gemini to help with development, to help build basic UI layout(helping with css file), and also helping with DOM manipulation, when user auto places object, and when they override control. 