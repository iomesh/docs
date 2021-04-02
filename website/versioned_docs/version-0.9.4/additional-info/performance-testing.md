---
id: version-0.9.4-performance-testing
title: Performance Testing
sidebar_label: Performance Testing
original_id: performance-testing
---

## FIO-based Performance Testing

1. Create a pod for fio test

```shell
kubectl apply -f http://www.iomesh.com/docs/assets/iomesh-csi-driver/example/fio.yaml
```

2. Wait until fio-pvc bound is finished and fio pod is ready

```shell
kubectl get pvc fio-pvc
```

```output
NAME      STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS                AGE
fio-pvc   Bound    pvc-d7916b34-50cd-49bd-86f9-5287db1265cb   30Gi       RWO            iomesh-csi-driver-default   15s
```

```shell
kubectl wait --for=condition=Ready pod/fio
```

```output
pod/fio condition met
```

3. Run fio tests

```shell
kubectl exec -it fio sh
fio --name fio --filename=/mnt/fio --bs=256k --rw=write --ioengine=libaio --direct=1 --iodepth=128 --numjobs=1 --size=$(blockdev --getsize64 /mnt/fio)
fio --name fio --filename=/mnt/fio --bs=4k --rw=randread --ioengine=libaio --direct=1 --iodepth=128 --numjobs=1 --size=$(blockdev --getsize64 /mnt/fio)
```

4. Clean up

```shell
kubectl delete pod fio
kubectl delete pvc fio-pvc
# You need to delete pv when reclaimPolicy is Retain
kubectl delete pvc-d7916b34-50cd-49bd-86f9-5287db1265cb
```
