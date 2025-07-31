import os
import sys
import pandas as pd
from io import StringIO
from datetime import date as py_date

# Adjust the path to correctly find the api module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from api.database import SessionLocal, engine
from api.models import Festival, Base
from api import date_engine
import holidays

# The long string of CSV data
csv_data = """Event,Month,Date,Location,Type,Experience Summary,Content Potential,🎬 Hook/Intro Line,🎙️ Voiceover Prompt,🎯 Ideal Titles
---,---,---,---,---,---,---,---,---,---
Jallikattu,Jan,Jan 15,"Alanganallur, Tamil Nadu",Folklore,"Bull-taming, raw energy","Action reels, slow-mo docu",Ever seen a man dodge a charging bull... bare-handed?,"In Tamil Nadu, bravery runs wild during Pongal",India’s Wildest Festival
Rann Utsav,Nov,Nov 1,"Dhordo, Kutch, Gujarat",Cultural/Nature,White desert fiesta,"Drone shots, crafts, lifestyle",What if the moon was on earth?,Rann isn’t just white—it’s alive,Moonlight on Earth
Apricot & Snow Blossom,Jan,Jan 15,"Sham Valley, Ladakh",Natural,Snow + pink blossom,"Minimalist vlog, travel reels",Snow meets Sakura in India’s coldest corner,Apricot trees blush under Ladakh’s snow,Blossom in the Desert
Shakrain Kite Festival,Jan,Jan 14,"Old Kolkata, West Bengal",Street Culture,Rooftop kite wars,"Street energy, cut-fast reels",When rooftops become battlegrounds,Let’s rise with every kite that cuts the sky,Kite Chaos
Bhoota Kola,Jan,Jan 15,"Udupi & Dakshina Kannada, Karnataka",Ritual,Possession & trance,"Portrait docu, intense reels",Can a man become a god for one night?,Bhoota Kola isn’t performance—it's possession,Gods Walk Here
Bhagoria Haat,Mar,Mar 7,"Jhabua district, MP",Tribal,Elopement fest,"Face paint, romance, rural docu",Where lovers elope with colors on their cheeks,"Love is loud, tribal, and unapologetic",Elopement Carnival
Khajuraho Dance Fest,Feb,Feb 20,"Khajuraho, MP",Classical,Dance & architecture fusion,"Cinematic heritage reels",Ancient walls move with modern rhythm,Each step echoes centuries,Dance of Stones
Phool Dei,Mar,Mar 14,"Kumaon & Garhwal regions, Uttarakhand",Ritual,Flower offering by kids,"Cute reels, spring vibes",Spring knocks gently in the hills,Little hands welcome a new season,Flowers at the Door
Lathmar Holi,Mar,Mar 8,"Barsana & Nandgaon, UP",Folklore,Women hit men (playfully),"Slow-mo, folk + chaos",Where women beat men—with love and sticks!,Holi hits different in Barsana,Lathmar: Holi with a Twist
Kumaon Holi,Feb,Feb 3,"Almora, Uttarakhand",Cultural,Sung Holi with music,"Folk reels, lyrics, attire","This Holi is sung, not thrown",Music brings colors in the Himalayas,Singing Holi
Mewar Holika Dahan,Mar,Mar 13,"City Palace, Udaipur, Rajasthan",Royal Ritual,Fire by kings,"Firelit shots, heritage B-roll",When kings light the Holi fire,Mewar’s royal tradition still burns,Royal Holika
Padayani,Feb,Feb 20,"Kadammanitta, Kerala",Ritual Mask Dance,Colorful mask dance to appease Goddess Bhadrakali,"Dramatic reels, fierce expressions","When masks dance, gods awaken",Padayani is a plea in performance,Dance of the Divine Face
Tulip Garden,Mar,Mar 20,"Srinagar, Kashmir",Nature,Colorful bloom + snow peaks,"Drone + slow dolly shots",Is this Kashmir or Amsterdam?,Tulips bloom like a poem,Kashmir in Bloom
Gangaur,Mar,Mar 15,"Jaipur, Rajasthan",Women's Fest,Women process with idols,"Traditional wear, portraits",She walks with a goddess in her arms,Gangaur celebrates divine womanhood,Walk of the Women
Chithirai Fest,Apr,Apr 19,"Madurai, Tamil Nadu",Divine Marriage,Re-enacted god wedding,"Docu storytelling",An epic wedding of gods,Madurai turns divine for love,Divine Bride
"Vesak/Buddha Purnima (Sanchi, Bodhgaya)",May,May 12,"Sanchi, MP & Bodh Gaya, Bihar",Buddhist Gathering,Sacred ceremonies under Bodhi tree,"Calm docu, peaceful vlogs",Peace blossoms where Buddha walked,Bodh Gaya glows with silence,Enlightenment Eve
Valley of Flowers Opens,Jun,Jun 1,"Valley of Flowers National Park, Uttarakhand",Nature,Hidden floral heaven,"Macro + trekking reels",Heaven isn’t above—it’s blooming here,Each step a color explosion,Valley of Magic
Buddha Purnima,May,May 12,"Bodh Gaya, Bihar & Leh, Ladakh",Spiritual,"Peaceful, meditative","Minimalist reels",Silence speaks in Bodh Gaya,Born beneath this full moon,Stillness in the Light
Moatsu Mong,May,May 1,"Mokokchung district, Nagaland",Tribal,"Harvest, dance, renewal","Short docu, Ao tribe vibe","When the tribe rests, culture sings","Songs, soul, and celebration",Songs of Moatsu
Vat Savitri Vrat,May,May 26,"Across Bihar & MP",Ritual,Women vow under banyan tree,"Portraits + symbolism",She ties prayers around a banyan tree,A quiet ritual of strength,Vow of the Banyan
Ambubachi Mela,Jun,Jun 22,"Kamakhya Temple, Guwahati, Assam",Tantric,Goddess menstruation,"Bold reels, temple closeups","When the goddess bleeds, the temple shuts",Power in blood and belief,Bleeding Divinity
Wari Pilgrimage (Palkhi Yatra),Jun,Jun 21,"Alandi & Dehu, Maharashtra",Devotional,200 km emotional pilgrimage for Lord Vitthal,"POV + pilgrimage docu",Would you walk for your faith?,Every blister tells a story,The Soul Walk
Chhath Prep Begins,Oct,Oct 15,"Ghats of Patna, Bihar & Varanasi, UP",Devotional,River cleaning & rituals,"BTS-style reels",Faith begins before the crowd,Readying the river before sunrise,Chhath Prep Diaries
Mawsynram Monsoon,Jun,Jun 3,"Mawsynram, Meghalaya",Natural,World’s wettest place,"Moody shots, rain-life",Where clouds don’t float—they live,Downpour diaries of Meghalaya,Raining Realities
Kawad Yatra,Jul,Jul 21,"Haridwar, Uttarakhand to hometowns",Devotional,Devotees carry Ganga water barefoot,"Roadside docu, raw faith content",Barefoot with Shiva on their lips,Every drop carried with devotion,Walk of Faith
Nag Panchami,Aug,Aug 9,"Ujjain, MP & Battis Shirala, MH",Folk,Snake worship,"Close-up, visual storytelling",Would you feed a snake with devotion?,India worships what others fear,Snake & Spirit
Teej Festival,Aug,Aug 7,"Jaipur, Rajasthan & across Bihar",Women's Fest,"Swings, fasting, green sarees","Saree reels + rituals",Where women swing with faith,Longing in every sway,Swinging Traditions
Bathukamma,Sep,Sep 22,"Hyderabad, Telangana",Floral,Women build flower towers,"Drone + cultural colors",Flower mountains of faith,Telangana blooms with rhythm,Bathukamma Beats
Gogaji Fair,Aug,Aug 30,"Gogamedi, Hanumangarh, Rajasthan",Folk,"Firewalks, horsemen","Dusty action reels",Where warriors ride for a snake god,Legend gallops with fire,Wrath & Worship
Ziro Music Fest,Sep,Sep 25,"Ziro Valley, Arunachal Pradesh",Indie/Nature,Boho music in rice fields,"Chill reels, crowd shots",This is not Coachella. It’s better.,When paddy fields echo music,Fields of Sound
Nuakhai,Aug,Aug 30,"Sambalpur region, Odisha",Tribal,"Grain worship, community food","Food docu + folk songs",Harvest begins with a thank you,Taste meets tradition,Taste of Tradition
Neermahal Boat Race,Aug,Aug 15,"Rudrasagar Lake, Melaghar, Tripura",Sport/Folk,Palace-side boat races,"Drone + tribal drums",When water becomes a battlefield,Royal boat races of Tripura,Palace & Paddle
Mysuru Dasara,Sep,Sep 22,"Mysuru, Karnataka",Royal,"Elephants, palace lighting","Golden hour magic",India’s most regal procession,Dasara of gods & kings,Dasara of Kings
Bastar Dussehra,Jul,Jul 20,"Jagdalpur, Bastar, Chhattisgarh",Tribal,Longest dussehra (75 days),"Trance + tribal docu","No Rama, no Ravana—only Devi",The goddess takes center stage,Bastar’s Own Epic
Navratri (Garba & Golu),Sep,Sep 22,"Vadodara, Gujarat & Chennai, TN",Cultural,Dance & display,"Dual-style content",When feet pray and dolls preach,Nine nights of faith in motion,"Nine Nights, Two Tales"
Chhath Puja,Oct,Oct 25,"Ghats of Patna, Bihar & Varanasi, UP",Devotional,Women pray to sun in river,"Silhouettes + docu reel",They worship the setting sun,Faith touching the water,Sunrise of Faith
Pushkar Camel Fair,Nov,Nov 4,"Pushkar, Rajasthan",Trade/Folk,Camel beauty contest + chaos,"Portrait + folk storytelling",Camels aren’t just animals—they’re art,Pushkar’s folk chaos,Horns & Heritage
Sohrai Festival,Oct,Oct 22,"Hazaribagh district, Jharkhand",Tribal Art,Cow worship + wall painting,"Visual storytelling",Their walls speak after Diwali,Muddy murals of devotion,Painted Faith
Hornbill Festival,Dec,Dec 1,"Naga Heritage Village, Kisama, Nagaland",Tribal,All-tribe performance showcase,"Docu series + vlogs",Where India’s tribes tell their story,Not cosplay—it’s culture,Voices of the Hills
Seng Kut Snem,Dec,Dec 23,"Shillong, Meghalaya",Khasi Culture,"Pride day, parade, music","Culture walk reels",Khasi voices walk proud,Meghalaya’s roots in motion,Echoes of Meghalaya
Theyyam,Dec,Dec 15,"Kannur & Kasaragod districts, Kerala",Ritual Dance,Possession fire dance,"Mythology reels",They don’t dance for gods—they become them,Fire meets flesh and faith,Trance of the Ancients
"""

def main():
    # Re-create the database to ensure a fresh start
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    df = pd.read_csv(StringIO(csv_data))
    
    # Pre-fetch holidays for the current year to be efficient
    year_holidays = holidays.country_holidays('IN', years=py_date.today().year)

    try:
        for index, row in df.iterrows():
            # Create a temporary object to pass to the date engine
            temp_festival_obj = type('TempFestival', (object,), {
                'event_name': row["Event"],
                'general_date': row["Date"],
                'month': row["Month"]
            })()
            
            # Calculate the accurate date using the date engine
            calculated_date = date_engine.get_festival_date(temp_festival_obj, py_date.today().year, year_holidays)

            # --- THIS IS THE FIX ---
            # Manually map CSV columns to the correct model attributes
            festival_obj = Festival(
                event_name=row["Event"],
                month=row["Month"],
                general_date=row["Date"],
                location=row["Location"],
                type=row["Type"],
                summary=row["Experience Summary"],
                content_potential=row["Content Potential"],
                hook_intro=row["🎬 Hook/Intro Line"],
                voiceover_prompt=row["🎙️ Voiceover Prompt"],
                ideal_titles=row["🎯 Ideal Titles"],
                accurate_date=calculated_date # Store the calculated date permanently
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