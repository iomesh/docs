---
id: replace-failed-disk
title: Replace Failed Disk
sidebar_label: Replace Failed Disk
---

用户可以通过如下步骤更换 IOMesh 集群中的故障磁盘

1. 获取 meta leader pod 名称
```shell
kubectl get pod -n iomesh-system -l=iomesh.com/meta-leader -o=jsonpath='{.items[0].metadata.name}'
```
```output
iomesh-meta-0
```

2. 进入 meta leader pod
```shell
kubectl exec -it iomesh-meta-0 -n iomesh-system -c iomesh-meta bash
```

3. 检查集群是否有正在迁移或恢复的数据
多次执行该命令，确保输出的值都为0。如果有不为 0 的字段则需要等待其变为 0
```shell
/opt/iomesh/iomeshctl summary cluster | egrep "recovers|migrates" 
```
```output
num_ongoing_recovers: 0
num_pending_recovers: 0
num_ongoing_migrates: 0
num_pending_migrates: 0
  pending_migrates_bytes: 0
  pending_recovers_bytes: 0
      pending_migrates_bytes: 0
      pending_recovers_bytes: 0
      pending_migrates_bytes: 0
      pending_recovers_bytes: 0
      pending_migrates_bytes: 0
      pending_recovers_bytes: 0
  num_ongoing_recovers: 0
  num_pending_recovers: 0
  num_ongoing_migrates: 0
  num_pending_migrates: 0
    pending_migrates_bytes: 0
    pending_recovers_bytes: 0
```

4. 查看需要更换的硬盘
```shell
kubectl --namespace iomesh-system get bd
```
```output
NAME                                           NODENAME      PATH       FSTYPE   SIZE          CLAIMSTATE   STATUS   AGE
blockdevice-41f0c2b60f5d63c677c3aca05c2981ef   qtest-k8s-0   /dev/sdc            53687091200   Unclaimed    Active   29h
blockdevice-66312cce9037ae891a099ad83f44d7c9   qtest-k8s-1   /dev/sdc            69793218560   Claimed      Active   44h
blockdevice-7aff82fe93fac5153b14af3c82d68856   qtest-k8s-2   /dev/sdb            69793218560   Claimed      Active   44h
```

5. 假设需要更换的硬盘为 `blockdevice-66312cce9037ae891a099ad83f44d7c9`，执行 `kubectl edit -n iomesh-system iomesh` 修改 deviceMap 字段，将需要卸载的硬盘加入 exclude 队列

```yaml
    # ...
    deviceMap:
      # ...
      dataStore:
        selector:
          matchExpressions:
          - key: iomesh.com/bd-driverType
            operator: In
            values:
            - HDD
          matchLabels:
            iomesh.com/bd-deviceType: disk
        exclude:
	- blockdevice-66312cce9037ae891a099ad83f44d7c9
	# ...
```

6. 重复执行步骤3，确保数据迁移或恢复已经完成

7. 确保 blockdevice 处于 `unclaimed` 状态
```shell
kubectl get bd blockdevice-66312cce9037ae891a099ad83f44d7c9 -n iomesh-system
```
```output
NAME                                           NODENAME      PATH       FSTYPE   SIZE          CLAIMSTATE   STATUS   AGE
blockdevice-66312cce9037ae891a099ad83f44d7c9   qtest-k8s-1   /dev/sdc            69793218560   Unclaimed      Active   44h
```

8. 拔出该硬盘，该 blockdevice 会进入 Inactive 状态，此时删除该 blockdevice 以及和他对应的 blockdeviceclaim
```shell
kubectl patch bdc/blockdevice-66312cce9037ae891a099ad83f44d7c9 -p '{"metadata":{"finalizers":[]}}' --type=merge -n iomesh-system
kubectl patch bd/blockdevice-66312cce9037ae891a099ad83f44d7c9 -p '{"metadata":{"finalizers":[]}}' --type=merge -n iomesh-system
kubectl delete bdc blockdevice-66312cce9037ae891a099ad83f44d7c9 -n iomesh-system
kubectl delete bd blockdevice-66312cce9037ae891a099ad83f44d7c9 -n iomesh-system
```

9. 插入新硬盘，参考 [IOMesh配置章节](setup-iomesh) 配置 devicemap 挂载新硬盘
