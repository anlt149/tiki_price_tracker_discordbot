const BOT_TOKEN = 'NzE5MTE2MDM2NzA3ODQ0MTM2.Xu2cvw.2-yD4eNucR8vSFhGpWdpkJ01DmA';
const CHANNEL_ID = '719114527643402252';

/**
 * “At minute 1 past every 2nd hour from 0 through 23 on every day-of-week from Monday through Sunday.”
 */
const SCHEDULE_TIME = "1 0-23/2 * * 1-7";

module.exports = {
    BOT_TOKEN,
    CHANNEL_ID,
    SCHEDULE_TIME
}