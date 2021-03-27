**Author: swortal@gmail.com**

## Build system:
**webpack**  
= bower + grunt/gulp;  
Full of plugin, covers both build and custom task. Support both forntend and backend.

## Environment Config:
**dotenv**: one config for one environment

## I18N
**i18next**:   
- **Selection reason**: 
    - simple; 
    - support various formatting and interpolation; 
    - popular; 
    - plenty of middleware such as locale detector.
    - Our app is simple and only need message localization right now.
    - Support both frontend and backend.

**Other options:**  
**globalizejs:**  
- Pros:    
    - All in one localization including message, date, currency, number and so on.
- Cons:
    - Many types localization metadatas such as currency, number, dates to download and initialize. Initialization logic is complicated.

## Database
**mongodb**: reason stated in design doc.  

## Backend
### Server
**Nodejs**: First class citizen to mongodb  
### Language
**TypeScript**: JavaScript with type check. Clear typing and easy to maintain. Also same language used across frontend and backend so that we only need a single build system
### Framework
**ExpressJs**: Most popular, unopinionated framework. 
### Database driver
**Typegoose**: Mongoose + TypeScript. Mongoose supports defining db schema an***d data validation based on schema which native mongodb driver doesn't have. But the schema is defined in JSON format. Typegoose supports defining mongoose schema in TypeScript class which is clearer. 
### Logger:
**winston**: Support both logging and profiling

### Process Management:
**pm2**:  
- Auto restart the nodejs app on failure
- Auto clustering the nodejs app
- Supports zero downtime reload


## Protocal between frontend and backend.
**Protobuf**: Field type definition and validation. Could be compiled to multiple languages

## Frontend
**React + Redux**: 
- Easy to modulerize component and reuse it. 
- JSX syntax is a good mixture of TypeScript and html. 
- No two way binding between html value and JavaScript value which is more flexible. 
- model - view pattern through Reach + Redux is simpler than mvc pattern. 

**sass + css module**: sass enables more  programming power. css module convert css class name in a component's own stylesheet to globally unique css name so that the full component (html + JavaScript + css) can be reused anywhere without breaking other component's css definition. 