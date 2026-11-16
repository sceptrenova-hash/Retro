from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math
W,H=1280,720
OUT=Path('/home/user/workspace/RetroWork/Retro/docs/assets/video_frames')
OUT.mkdir(parents=True,exist_ok=True)
font_paths={
 'regular':'/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
 'medium':'/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
 'mono':'/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
}
def F(kind,size): return ImageFont.truetype(font_paths[kind],size)
ORANGE=(255,91,46); CREAM=(244,242,235); MUTED=(147,155,149); GREEN=(183,239,136)
def rounded(d,box,r,fill,outline=None,width=1): d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=width)
def label(d,xy,text,color=MUTED,size=14): d.text(xy,text,font=F('mono',size),fill=color)
def title(d,xy,text,size=44): d.text(xy,text,font=F('medium',size),fill=CREAM,spacing=5)
def base(scene):
 im=Image.new('RGB',(W,H),(9,11,12))
 glow=Image.new('RGBA',(W,H),(0,0,0,0)); g=ImageDraw.Draw(glow)
 g.ellipse((700,-160,1440,600),fill=(255,91,46,48)); g.ellipse((-220,350,650,1100),fill=(56,109,158,42))
 glow=glow.filter(ImageFilter.GaussianBlur(95)); im=Image.alpha_composite(im.convert('RGBA'),glow).convert('RGB')
 d=ImageDraw.Draw(im)
 # restrained background grid
 for x in range(0,W,52): d.line((x,0,x,H),fill=(255,255,255,7),width=1)
 for y in range(0,H,52): d.line((0,y,W,y),fill=(255,255,255,7),width=1)
 d.rectangle((0,0,W,64),fill=(8,10,11))
 d.text((55,20),'retro',font=F('medium',19),fill=CREAM); d.text((104,20),'.',font=F('medium',21),fill=ORANGE)
 label(d,(W-265,25),'MACOS 14+  /  PRIVATE BETA',MUTED,10)
 # left titles
 labels=[('01 / CHOOSE YOUR PACE','Choose a pace.','Sprint. Pomodoro. Deep. Flow.'),('02 / SET THE ROOM','Set the room.','A note, a checklist, a sound.'),('03 / RETURN GENTLY','Leave a breadcrumb.','A break, then back to your thread.')]
 eyebrow,head,sub=labels[scene]
 label(d,(58,141),eyebrow,ORANGE,12)
 title(d,(58,184),head,42)
 # short orange accent line
 d.rounded_rectangle((58,250,116,254),radius=2,fill=ORANGE)
 d.text((58,281),sub,font=F('regular',15),fill=(173,180,174))
 d.text((58,316),'A NATIVE MAC FOCUS RITUAL',font=F('mono',10),fill=(116,126,120))
 # desktop / app window
 rounded(d,(360,106,1226,628),18,(26,30,31),(83,91,88),1)
 rounded(d,(371,117,1215,618),12,(14,17,18),(57,64,62),1)
 # top app chrome
 d.line((372,157,1214,157),fill=(53,60,57),width=1)
 for i,c in enumerate(((250,93,79),(234,186,75),(91,190,98))): d.ellipse((391+i*16,132,400+i*16,141),fill=c)
 label(d,(673,132),'RETRO FOCUS STUDIO',MUTED,10)
 label(d,(1127,132),'•••',MUTED,12)
 # app tabs
 tabs=['◷ TIMER','♫ MUSIC','▷ NOW PLAYING','◈ BLOCKER']
 tx=405
 for i,t in enumerate(tabs):
  col=CREAM if i==scene%4 else (134,143,137)
  if i==scene%4: rounded(d,(tx-9,169,tx+96,197),7,(39,44,43))
  d.text((tx,176),t,font=F('mono',9),fill=col)
  tx += [120,115,156,130][i]
 d.line((389,211,1198,211),fill=(50,57,54),width=1)
 # top hardware capsule
 rounded(d,(500,222,1093,286),22,(5,7,7),(55,61,59),1)
 rounded(d,(516,238,543,265),14,(33,38,37),(73,79,76),1); d.text((525,244),'■',font=F('regular',10),fill=(222,222,215))
 rounded(d,(552,238,579,265),14,(255,91,46),(255,133,89),1); d.text((561,244),'Ⅱ',font=F('medium',11),fill='white')
 d.line((591,237,591,271),fill=(60,67,64),width=1)
 if scene==0:
  label(d,(614,234),'POMODORO',MUTED,8); d.text((614,248),'25:00',font=F('medium',22),fill=CREAM)
 elif scene==1:
  label(d,(614,234),'DEEP FOCUS',MUTED,8); d.text((614,248),'24:18',font=F('medium',22),fill=CREAM)
 else:
  label(d,(614,234),'COFFEE BREAK',MUTED,8); d.text((614,248),'04:32',font=F('medium',22),fill=CREAM)
 rounded(d,(752,238,779,265),14,(33,38,37),(73,79,76),1); d.text((760,244),'☕',font=F('regular',10),fill=(250,191,148))
 d.ellipse((817,237,845,265),fill=(38,42,41),outline=(73,79,76)); d.text((827,244),'♫',font=F('medium',10),fill=ORANGE)
 # content cards
 if scene==0:
  label(d,(417,325),'YOUR NEXT STRETCH',MUTED,10); d.ellipse((960,324,968,332),fill=GREEN); label(d,(976,322),'READY',GREEN,9)
  # timer ring
  d.ellipse((424,358,626,560),outline=(52,59,56),width=5); d.arc((424,358,626,560),-82,215,fill=ORANGE,width=5)
  label(d,(485,422),'POMODORO',MUTED,9); d.text((475,447),'25:00',font=F('medium',38),fill=CREAM); label(d,(494,495),'FOCUS TIME',MUTED,8)
  label(d,(680,362),'PICK A RHYTHM',MUTED,9)
  for i,(name,desc) in enumerate([('Sprint','15 focus / 3 rest'),('Pomodoro','25 focus / 5 rest'),('Deep','50 focus / 10 rest'),('Flow','90 focus / 15 rest')]):
   y=388+i*43; fill=(50,35,30) if i==1 else (25,29,28); border=(115,68,53) if i==1 else (48,54,51)
   rounded(d,(664,y,1118,y+35),5,fill,border,1); label(d,(679,y+11),f'{i+1:02}',ORANGE,9); d.text((717,y+7),name,font=F('medium',12),fill=CREAM); d.text((820,y+10),desc,font=F('regular',10),fill=MUTED)
  label(d,(679,574),'FOCUS · BREAK · REPEAT',MUTED,9)
 elif scene==1:
  label(d,(416,325),'ONE SESSION, A FEW GOOD TOOLS',MUTED,10)
  rounded(d,(416,354,750,554),8,(23,28,27),(53,60,56),1)
  label(d,(438,374),'SESSION CHECKLIST',MUTED,9)
  items=[('Choose a chapter',True),('Write one clear note',True),('Finish the next section',False)]
  for i,(txt,checked) in enumerate(items):
   y=410+i*42; rounded(d,(438,y,454,y+16),4,ORANGE if checked else (20,23,22),(255,120,81) if checked else (98,106,100),1)
   if checked:d.line((442,y+8,447,y+12),fill='white',width=2);d.line((447,y+12,452,y+4),fill='white',width=2)
   d.text((468,y+1),txt,font=F('regular',11),fill=CREAM if not checked else (185,193,187))
  d.line((438,544,727,544),fill=(52,59,55),width=1)
  rounded(d,(779,354,1157,554),8,(22,26,25),(53,60,56),1)
  label(d,(802,374),'BUNDLED SOUND DECK',MUTED,9)
  d.ellipse((811,404,950,543),fill=(9,11,11),outline=(74,81,76),width=1)
  for r in range(15,64,9):d.ellipse((880-r,473-r,880+r,473+r),outline=(48,55,52),width=1)
  d.ellipse((864,457,896,489),fill=ORANGE);d.text((876,465),'♫',font=F('medium',12),fill='white')
  d.text((974,424),'Lo-fi Study',font=F('medium',17),fill=CREAM); d.text((974,452),'warm keys · soft crackle',font=F('regular',10),fill=MUTED)
  rounded(d,(972,483,1128,516),5,ORANGE);d.text((991,493),'▶  PLAY SAMPLE',font=F('mono',9),fill='white')
  label(d,(802,574),'NOTES & SESSION HISTORY STAY ON THIS MAC',MUTED,8)
 else:
  label(d,(416,325),'A SESSION ISN’T A STREAK TO CHASE',MUTED,10)
  rounded(d,(416,354,1147,548),9,(22,26,25),(53,60,56),1)
  d.ellipse((460,385,568,493),fill=(36,43,39),outline=(111,158,87),width=2); d.text((495,415),'✓',font=F('medium',34),fill=GREEN)
  label(d,(600,381),'SESSION RECAP',MUTED,9); d.text((600,408),'One thing, all the way in.',font=F('medium',24),fill=CREAM)
  d.text((600,450),'Focus time',font=F('regular',11),fill=MUTED);d.text((1013,450),'50 min',font=F('medium',14),fill=CREAM)
  d.line((600,477,1104,477),fill=(55,62,58),width=1)
  d.text((600,495),'Your breadcrumb',font=F('regular',11),fill=MUTED);d.text((1013,495),'Next section',font=F('medium',12),fill=CREAM)
  rounded(d,(600,523,750,558),5,(255,91,46));d.text((616,533),'BEGIN AGAIN ↗',font=F('mono',9),fill='white')
  rounded(d,(416,565,1147,600),5,(17,20,19),(48,55,51),1)
  label(d,(435,577),'SESSION LOG  /  SAVED LOCALLY',MUTED,8);label(d,(1005,577),'45 MIN TODAY',GREEN,8)
 # footer
 d.rectangle((0,654,W,H),fill=(7,8,9))
 label(d,(57,678),'A VISUAL GUIDE BASED ON THE CURRENT MAC PROJECT',MUTED,9)
 label(d,(914,678),'NOT A SCREEN RECORDING',ORANGE,9)
 return im
scenes=[base(i) for i in range(3)]
# first frame as an accurate video poster
scenes[0].save('/home/user/workspace/RetroWork/Retro/docs/assets/retro-tour-poster.jpg',quality=90,optimize=True)
# 18 seconds, 24fps; cross-fade the three interface moments and animate a subtle orange highlight
FPS=24; TOTAL=18*FPS
for n in range(TOTAL):
 t=n/FPS
 if t<5.7: img=scenes[0].copy()
 elif t<6.4: img=Image.blend(scenes[0],scenes[1],(t-5.7)/.7)
 elif t<11.7: img=scenes[1].copy()
 elif t<12.4: img=Image.blend(scenes[1],scenes[2],(t-11.7)/.7)
 else: img=scenes[2].copy()
 # subdued, moving scan of light across the desktop chrome, never over text
 d=ImageDraw.Draw(img,'RGBA')
 x=int(380+((t*105)%800))
 d.line((x,118,x+140,118),fill=(255,125,76,52),width=2)
 # continuous timer movement in focus scene
 if 6.4<=t<11.7:
  d.rounded_rectangle((613,246,721,276),radius=2,fill=(5,7,7,255))
  label(d,(614,234),'DEEP FOCUS',MUTED,8)
  sec=max(0,24*60+18-int(t-6.4)); mm,ss=divmod(sec,60)
  d.text((614,248),f'{mm:02}:{ss:02}',font=F('medium',22),fill=CREAM)
 img.save(OUT/f'{n:04d}.png',compress_level=1)
print(f'generated {TOTAL} frames at {OUT}; poster ready')
