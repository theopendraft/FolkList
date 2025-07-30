import csv
import os
import sys
import pandas as pd
from io import StringIO

# This allows the script to find the 'api' module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from api.database import SessionLocal, engine
from api.models import Festival, Base

# --- Your CSV data is now safely inside the script ---
csv_data = """Event/Festival,Month,Date,Location,Type,Experience Summary,Content Potential,🎬 Hook/Intro Line,🎙️ Voiceover Prompt,🎯 Ideal Titles
Jallikattu,Jan,Jan 15–17,Tamil Nadu,Folklore,"Bull-taming, raw energy","Action reels, slow-mo docu",Ever seen a man dodge a charging bull... bare-handed?,"In Tamil Nadu, bravery runs wild during Pongal",India’s Wildest Festival
Rann Utsav,Jan,Until Feb 20,Gujarat,Cultural/Nature,White desert fiesta,"Drone shots, crafts, lifestyle",What if the moon was on earth?,Rann isn’t just white—it’s alive,Moonlight on Earth
Apricot & Snow Blossom,Jan,Late Jan–Mar,Ladakh,Natural,Snow + pink blossom,"Minimalist vlog, travel reels",Snow meets Sakura in India’s coldest corner,Apricot trees blush under Ladakh’s snow,Blossom in the Desert
Shakrain Kite Festival,Jan,Jan 14,Bengal,Street Culture,Rooftop kite wars,"Street energy, cut-fast reels",When rooftops become battlegrounds,Let’s rise with every kite that cuts the sky,Kite Chaos
Bhoota Kola,Feb,Jan–Mar,Karnataka,Ritual,Possession & trance,"Portrait docu, intense reels",Can a man become a god for one night?,Bhoota Kola isn’t performance—it's possession,Gods Walk Here
Bhagoria Haat,Mar,Mar 7–13,MP,Tribal,Elopement fest,"Face paint, romance, rural docu",Where lovers elope with colors on their cheeks,"Love is loud, tribal, and unapologetic",Elopement Carnival
Khajuraho Dance Fest,Feb,Feb 20–26,MP,Classical,Dance & architecture fusion,Cinematic heritage reels,Ancient walls move with modern rhythm,Each step echoes centuries,Dance of Stones
Phool Dei,Mar,Starts Mar 14,Uttarakhand,Ritual,Flower offering by kids,"Cute reels, spring vibes",Spring knocks gently in the hills,Little hands welcome a new season,Flowers at the Door
Lathmar Holi,Mar,Mar 8–9,UP,Folklore,Women hit men (playfully),"Slow-mo, folk + chaos",Where women beat men—with love and sticks!,Holi hits different in Barsana,Lathmar: Holi with a Twist
Kumaon Holi,Mar,Early to Mid-Mar,Uttarakhand,Cultural,Sung Holi with music,"Folk reels, lyrics, attire","This Holi is sung, not thrown",Music brings colors in the Himalayas,Singing Holi
Mewar Holika Dahan,Mar,Mar 13,Rajasthan,Royal Ritual,Fire by kings,"Firelit shots, heritage B-roll",When kings light the Holi fire,Mewar’s royal tradition still burns,Royal Holika
Padayani,Mar,Mid-Mar – Late Apr,Kerala,Ritual Mask Dance,Colorful mask dance to appease Goddess Bhadrakali,"Dramatic reels, fierce expressions","When masks dance, gods awaken",Padayani is a plea in performance,Dance of the Divine Face
Tulip Garden,Apr,Late Mar – Mid-Apr,Kashmir,Nature,Colorful bloom + snow peaks,Drone + slow dolly shots,Is this Kashmir or Amsterdam?,Tulips bloom like a poem,Kashmir in Bloom
Gangaur,Apr,Mar 15 – Apr 2,Rajasthan,Women's Fest,Women process with idols,"Traditional wear, portraits",She walks with a goddess in her arms,Gangaur celebrates divine womanhood,Walk of the Women
Chithirai Fest,Apr,Apr 15 – May 1,TN,Divine Marriage,Re-enacted god wedding,Docu storytelling,An epic wedding of gods,Madurai turns divine for love,Divine Bride
Vesak/Buddha Purnima,May,May 12,"Bihar, MP",Buddhist Gathering,Sacred ceremonies under Bodhi tree,"Calm docu, peaceful vlogs",Peace blossoms where Buddha walked,Bodh Gaya glows with silence,Enlightenment Eve
Valley of Flowers Opens,Jun,Opens Jun 1,Uttarakhand,Nature,Hidden floral heaven,Macro + trekking reels,Heaven isn’t above—it’s blooming here,Each step a color explosion,Valley of Magic
Buddha Purnima,May,May 12,"Bihar, Ladakh",Spiritual,"Peaceful, meditative",Minimalist reels,Silence speaks in Bodh Gaya,Born beneath this full moon,Stillness in the Light
Moatsu Mong,May,May 1–3,Nagaland,Tribal,"Harvest, dance, renewal","Short docu, Ao tribe vibe","When the tribe rests, culture sings","Songs, soul, and celebration",Songs of Moatsu
Vat Savitri Vrat,Jun,May 26 / Jun 10,"Bihar, MP",Ritual,Women vow under banyan tree,Portraits + symbolism,She ties prayers around a banyan tree,A quiet ritual of strength,Vow of the Banyan
Ambubachi Mela,Jun,Jun 22–26,Assam,Tantric,Goddess menstruation,"Bold reels, temple closeups","When the goddess bleeds, the temple shuts",Power in blood and belief,Bleeding Divinity
Wari Pilgrimage (Palkhi),Jun,Jun 21 – Jul 6,Maharashtra,Devotional,200 km emotional pilgrimage for Lord Vitthal,POV + pilgrimage docu,Would you walk for your faith?,Every blister tells a story,The Soul Walk
Mawsynram Monsoon,Jul,Jun–Sep,Meghalaya,Natural,World’s wettest place,"Moody shots, rain-life",Where clouds don’t float—they live,Downpour diaries of Meghalaya,Raining Realities
Kawad Yatra,Jul,Jul 22 – Aug 19,"UP, Bihar, Haryana",Devotional,Devotees carry Ganga water barefoot,"Roadside docu, raw faith content",Barefoot with Shiva on their lips,Every drop carried with devotion,Walk of Faith
Nag Panchami,Aug,Aug 9,"MP, MH",Folk,Snake worship,"Close-up, visual storytelling",Would you feed a snake with devotion?,India worships what others fear,Snake & Spirit
Teej Festival,Aug,Aug 7,"Rajasthan, Bihar",Women's Fest,"Swings, fasting, green sarees",Saree reels + rituals,Where women swing with faith,Longing in every sway,Swinging Traditions
Bathukamma,Sep,Sep 23 – Oct 1,Telangana,Floral,Women build flower towers,Drone + cultural colors,Flower mountains of faith,Telangana blooms with rhythm,Bathukamma Beats
Gogaji Fair,Aug,Starts Aug 18,Rajasthan,Folk,"Firewalks, horsemen",Dusty action reels,Where warriors ride for a snake god,Legend gallops with fire,Wrath & Worship
Ziro Music Fest,Sep,Sep 25–28 (Tentative),Arunachal,Indie/Nature,Boho music in rice fields,"Chill reels, crowd shots",This is not Coachella. It’s better.,When paddy fields echo music,Fields of Sound
Nuakhai,Aug,Aug 29,Odisha,Tribal,"Grain worship, community food",Food docu + folk songs,Harvest begins with a thank you,Taste meets tradition,Taste of Tradition
Neermahal Boat Race,Aug,Mid to Late Aug,Tripura,Sport/Folk,Palace-side boat races,Drone + tribal drums,When water becomes a battlefield,Royal boat races of Tripura,Palace & Paddle
Mysuru Dasara,Oct,Sep 23 – Oct 2,Karnataka,Royal,"Elephants, palace lighting",Golden hour magic,India’s most regal procession,Dasara of gods & kings,Dasara of Kings
Bastar Dussehra,Oct,Jul 19 – Oct 3,Chhattisgarh,Tribal,Longest dussehra (75 days),Trance + tribal docu,"No Rama, no Ravana—only Devi",The goddess takes center stage,Bastar’s Own Epic
Navratri (Garba & Golu),Oct,Sep 23 – Oct 1,"Gujarat, TN",Cultural,Dance & display,Dual-style content,When feet pray and dolls preach,Nine nights of faith in motion,"Nine Nights, Two Tales"
Chhath Puja,Oct,Oct 28–29,"Bihar, UP",Devotional,Women pray to sun in river,Silhouettes + docu reel,They worship the setting sun,Faith touching the water,Sunrise of Faith
Pushkar Camel Fair,Nov,Nov 2–10,Rajasthan,Trade/Folk,Camel beauty contest + chaos,Portrait + folk storytelling,Camels aren’t just animals—they’re art,Pushkar’s folk chaos,Horns & Heritage
Sohrai Festival,Oct,Late Oct,Jharkhand,Tribal Art,Cow worship + wall painting,Visual storytelling,Their walls speak after Diwali,Muddy murals of devotion,Painted Faith
Hornbill Festival,Dec,Dec 1–10,Nagaland,Tribal,All-tribe performance showcase,Docu series + vlogs,Where India’s tribes tell their story,Not cosplay—it’s culture,Voices of the Hills
Seng Kut Snem,Nov,Nov 23,Meghalaya,Khasi Culture,"Pride day, parade, music",Culture walk reels,Khasi voices walk proud,Meghalaya’s roots in motion,Echoes of Meghalaya
Theyyam,Dec,Dec–Apr,Kerala,Ritual Dance,Possession fire dance,Mythology reels,They don’t dance for gods—they become them,Fire meets flesh and faith,Trance of the Ancients
"""

def main():
    # Re-create the database every time for a fresh start
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Use pandas to read the string as if it were a file
    df = pd.read_csv(StringIO(csv_data))
    
    try:
        for index, row in df.iterrows():
            festival_obj = Festival(
                event_name=row["Event/Festival"],
                month=row["Month"],
                general_date=row["Date"],
                location=row["Location"],
                type=row["Type"],
                summary=row["Experience Summary"],
                content_potential=row["Content Potential"],
                hook_intro=row["🎬 Hook/Intro Line"],
                voiceover_prompt=row["🎙️ Voiceover Prompt"],
                ideal_titles=row["🎯 Ideal Titles"]
            )
            db.add(festival_obj)
        
        db.commit()
        print("✅ Database created and populated successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()