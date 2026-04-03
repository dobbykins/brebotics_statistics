Welcome!

This document will cover a step-by-step understanding of the process to calculate EPA from other statistics like OPR and ELO. The purpose of EPA is provide almost a ranking for each FTC team similar to how FRC uses it. We can predict matches and have much more accurate power rankings with EPA! Now let's get into it!

The first thing to understand is the concept of EPA. EPA is a form of measurement that was made by Statbotics (PLEASE CHECK THEM OUT). I won't repeat word by word how they describe EPA but if you are interested, it's a quick read and I highly recommend it (almost demand it) before continuing this because it's gonna go from 0 to 100 real quick, so buckle in!
Here's the link, read all five post https://www.statbotics.io/blog

Step 1: FTC vs FRC
EPA is considered to be the holy grail of stats in FRC, since the developer made sure that every calculation and every variable worked hand in hand with the nature of FRC to be highly accurate. So a lot of the heavy work is done luckily. However, FTC is naturely different from FRC.

Let focus on mainly on the calculations for an individual's OPR. The first assumption will be that the initial EPA will be based on the average scores of the first TWO weeks of competition to get a much better understand of the average score and to get more data from various regions. 

Step 2: Constants to be considered.

The blog goes step by step into the different constants/variable used to make adjustments based on the nature of the competition. The first change that will be done is with the K constant. The K constant updates the weight that the score difference from the predicted score compared to the actual score has on a team's EPA. However, this constant changes based on the number of matches a team plays. This is to avoid having a zero-sum, basically the EPA has inflation and an EPA of 1000 in the first month is not the same in March. Now because teams in my region only play 12 matches in a entire season, the number of matchs to update the K value will be change to properly reflect adjustements through the season. The piecewise function will look like the following:

K =
| 0.5 | N <= 3 |
| 0.5 - 1/30 * (N-6) | 3<N<7 |
| 0.3 | N > 7 |

Now for the problematic one, M. M is a constant that is used as a defensive factor. As I mentioned before, FRC is naturally different than FTC, this difference now comes in play. In FRC, it is extremely common for teams to pick other teams purely because they are able to complete shut down other team from play (in a GP mannor ofc). If you recall (yes I am testing you), the M factor is used to consider surprises, based on if you scored more than you were supposed to (without penalties) or if the opposing alliance scored less than anticipated. Because it is more likely for teams to have disconnections on the field compared to having heavy defense played on them, we will be ignored this consistant for the time being.

So now we have both of our constants set and ready. This means we now have a way to set initial EPA for every team and update them after every match. 
