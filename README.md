
//BUILD

        vase deploy kardanesh (gereftane folder dist) bayad tuye directory morede nazar,
        command "npm run build" / "vite build" ro run konid



//DIRECTORES

    3 ta dir e asli darim.

        -admin_dashbhoard
        -handheld
        -security

                //ADMIN_DASHBOARD

                        /dota folder dakheleshe yeki "admin" va unyeki "dashboard"

                        **version nahayee (ke ba shadcn zadam az aval) tuye foldere "admin" qarar gerefte**
                        -version qadimi (ke be api vasl nist va static va zeshte) tuye foldere "dashboard" qarar gerefte

                //OTHER_DIRECTORIES

                        /baraye dastresi be source e handheld va security be:

                        handheld > react > hand > src
                        security > react > sec > src

                        /hame componentaye use dade shode tuye src hast va ta bayad moratab ham bashan age khoda bekhad

                        -enshalah .env add konam unam qarare tuye root har poroje bashe (alan tu hand hast)
                        -kharej az un felan aksare api url ha tuye "hand > src > hooks > apiconfig.ts" qarar gerefte va age bekhayed chizio avaz konid az unja mishe

                //ETEMADRANAEXPRESS
                
                        /api shahab hamash tuye mainserver.js hast, baqie folderash az version aval api esh dast nakhordan

                        **SHAHAB RUYE IN REPO COMMIT NAZADE FAQAT MAN CODESHO AVAZ KARDAM**

                        **for more info visit twitch.tv/shahab_sl**




//LAYOUT-PAGES-ROUTS

        /chizayee ke beyne safhe ha moshtarake (masalan hesader hand/sec) tuye "src > layout > layout.tsx" ast
        /page haye motefavet ke avaz mishan tuye "src > pages > ..." hastan
        /route haye app tuye "src > App.tsx" ke default appaye react e hastan



//COMMENTS
 
        /hame chiz comment dare va hameye commenta ba codium generate shode (bad az nahayee shodan code) chun man koonam goshade