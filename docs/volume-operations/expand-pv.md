---
id: expand-pv
title: Expand PV
sidebar_label: Expand PV
---

To expand the capacity of a PV, you only need to modify the field `storage` in its corresponding PVC.

**Prerequisite**

The StorageClass must have `allowVolumeExpansion` set to true. The default StorageClass `iomesh-csi-driver` already does this. If a StorageClass is created and configured with custom parameters, verify that its `allowVolumeExpansion` is set to `true`. 

**Procedure**

The following example assumes a YAML config `pvc.yaml` that points to a PVC `iomesh-example-pvc` with a capacity of `10Gi`.
```yaml
# Source: pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: iomesh-example-pvc
spec:
  storageClassName: iomesh-csi-driver
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi # The original capacity of the PVC.
```

1. Get the PVC. 

    ```bash
    kubectl get pvc iomesh-example-pvc
    ```

    If successful, you should see output below:

    ```output
    NAME                 STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS                AGE
    iomesh-example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   10Gi        RWO            iomesh-csi-driver           11m
    ```

2. Access `pvc.yaml`. Then set the field `storage` to a new value.
    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: iomesh-example-pvc
    spec:
      storageClassName: iomesh-csi-driver
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 20Gi # The new value must be greater than the original one.
    ```

3. Apply the modification.

    ```bash
    kubectl apply -f pvc.yaml
    ```

4. View the PVC and its corresponding PV. 

    > **_NOTE_:** The PV capacity will be changed to the new value, but the capacity value in the PVC will remain the same until it is actually used by the pod.

    ```bash
    kubectl get pvc iomesh-example-pvc 
    ```

   If successful, you should see output below. 

    ```output
    NAME                 STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS                AGE
    iomesh-example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   10Gi        RWO            iomesh-csi-driver           11m
    ```

5. Verify that the PV capacity was expanded. You can find the PV name from the PVC output.
   
    ```bash
    kubectl get pv pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca # The PV name you get in Step 4.
    ```

    If successful, you should see output below:
    ```output
    NAME                                       CAPACITY   RECLAIM POLICY   STATUS   CLAIM                       STORAGECLASS
    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   20Gi       Delete           Bound    default/iomesh-example-pvc  iomesh-csi-driver
    ```