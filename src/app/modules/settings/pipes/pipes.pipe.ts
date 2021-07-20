import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getTeamNameFromManagers'
})
export class GetTeamNameFromManagersPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    var result = value.map(team => (team.team_name));
    result.join(',')
    return result;
  }

}

